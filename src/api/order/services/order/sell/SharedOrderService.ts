import moment from 'moment';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { TradeType } from '@api/common/models';
import { Order, OrderStatus, PaymentInfo, SELL_ORDER_STEP } from '@api/order/models/Order';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import BigNumber from 'bignumber.js';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { PaymentTicketRepository } from '@api/order/repositories/PaymentTicketRepository';
import axios from 'axios';
import { PaymentTicket } from '@api/order/models/PaymentTicket';
import { env } from '@base/env';
import { CancelTicketBodyRequest, CancelTicketResponse, CreateTicketBodyRequest, CreateTicketResponse, PaymentTicketPayloadV2 } from '@api/order/types/PaymentTicket';
import { PaymentTicketRequestType, PaymentTicketStatusV2 } from '@api/order/enums/PaymentTicketEnum';
import { md5Hash } from '@base/utils/secure.util';
import { MerchantOrderLifecycleService } from '../MerchantOrderLifecycleService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';
import { P2PError } from '@api/common/errors/P2PError';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { events } from '@api/subscribers/events';
import { getGateway } from '@base/utils/bank-qr.utils';
import { UpdateTicketRequest } from '@api/order/requests/BocUpdateTicketRequest';

export class SharedSellOrderService extends SharedOrderService {
  constructor(
    private merchantOrderService: MerchantOrderLifecycleService,
    private sharedStatisticService: SharedStatisticService,
    private sharedAppealService: SharedAppealService,
    private sharedMasterDataService: SharedMasterDataService,
    private sharedPaymentMethodService: SharedPaymentMethodService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @InjectRepository() public orderRepository: OrderRepository,
    @InjectRepository() protected paymentTicketRepository: PaymentTicketRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }

  public async savePaymentTicketLog(paymentTicketId: string, originalPayload: UpdateTicketRequest) {
    return this.paymentTicketRepository.updatePaymentTicketPayloadLog(paymentTicketId, JSON.stringify(originalPayload));
  }

  public async getSellOrderByRefIdWithLock(refId: string): Promise<Order | null> {
    return await this.orderRepository.getOrderByRefIdWithLock(refId, TradeType.SELL);
  }

  public async updateSellOrderToAppealStep(orderId: string) {
    const updatedStep = SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER;
    await this.orderRepository.update(orderId, {
      step: updatedStep,
    });
    return updatedStep;
  }

  public async cancelOrderByAdmin(id: string, operationId: string): Promise<void> {
    await this.orderRepository.update(id, {
      cancelByOperationId: operationId,
      status: OrderStatus.CANCELLED,
      step: SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM,
      completedTime: moment.utc().toDate(),
      paymentMethodId: null,
    });
  }

  public async finishOrderByAdmin(id: string, totalFee: number): Promise<void> {
    await this.orderRepository.update(id, {
      status: OrderStatus.COMPLETED,
      step: SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER,
      completedTime: moment.utc().toDate(),
      totalFee,
    });
  }

  public async setTotalPenaltyFee(id: string, totalPenaltyFee: number) {
    await this.orderRepository.update(id, {
      totalPenaltyFee,
    });
  }

  public calculateTotalFeeSellOrder(order: Order): number {
    const totalFee = new BigNumber(order.amount).multipliedBy(order.price).multipliedBy(order.fee).toNumber();
    return Math.ceil(totalFee);
  }

  public async createPaymentTicket(order: Order) {
    const bankName = order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME);
    const gateway = getGateway(bankName);
    if (!gateway) {
      throw new P2PError(OrderLifeCycleError.BANK_NOT_SUPPORT);
    }
    const isBOCSupportedBank = await this.sharedPaymentMethodService.validateBOCSupportedBank(bankName);
    if (!isBOCSupportedBank) {
      throw new P2PError(OrderLifeCycleError.BANK_NOT_SUPPORT);
    }
    const ticket = await this.paymentTicketRepository.createPaymentTicket(order, gateway);
    await this.sendPaymentTicketAndUpdateTransferCode(ticket, order);
    return ticket;
  }

  public async pickUpPaymentTicket(paymentTicketId: string, approveAt: string, approveBy: string) {
    return this.paymentTicketRepository.pickUpPaymentTicket(paymentTicketId, approveAt, approveBy);
  }

  public async cancelPaymentTicket(paymentTicketId: string) {
    return this.paymentTicketRepository.cancelPaymentTicket(paymentTicketId);
  }

  public async getTicketByOrderId(orderId: string) {
    return this.paymentTicketRepository.getTicketByOrderId(orderId);
  }

  public async requestCancelPaymentTicket(paymentTicket: PaymentTicket, userRequest: string) {
    try {
      const payload: CancelTicketBodyRequest = {
        data: {
          id: paymentTicket.order.refId,
          user_request: userRequest,
        },
        request_type: PaymentTicketRequestType.CANCEL_TICKET,
        agent: env.boc.agent,
        token: md5Hash(`${env.boc.agent}${env.boc.apiKey}${paymentTicket.order.refId}`),
      };
      const { data } = await axios.post<CancelTicketResponse>(`${env.boc.apiUrl}/transfer-brand/agent-requests`, payload);
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (error: any) {
      this.log.error(`[requestCancelPaymentTicket] Error: ${error}`);
      throw new P2PError(OrderLifeCycleError.CANCEL_PAYMENT_TICKET_IS_FAILED);
    }
  }

  public async completePaymentTicket(paymentTicketId: string) {
    return this.paymentTicketRepository.completePaymentTicket(paymentTicketId);
  }

  public async getPaymentTicketWithLock(orderRefId: string) {
    return this.paymentTicketRepository.getPaymentTicketWithLock(orderRefId);
  }

  public async checkPaymentTicketProcessing(orderId: string) {
    return this.paymentTicketRepository.checkPaymentTicketProcessing(orderId);
  }

  private async getPaymentTicketPayload(paymentTicket: PaymentTicket, order: Order) {
    const bankName = order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME);
    const bankCode = await this.sharedPaymentMethodService.getBankCodeByBankName(bankName);
    const brandCreatedAt = moment(paymentTicket.createdAt).utcOffset(env.app.timeZone).format('YYYY-MM-DD HH:mm:ss');
    const ticketBody: PaymentTicketPayloadV2 = {
      id: order.refId,
      status: PaymentTicketStatusV2.NEW,
      amount: paymentTicket.amount,
      brand_created_at: brandCreatedAt,
      to_account_no: order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER),
      to_account_name: order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER),
      to_bank_code: bankCode,
      brand_approved_at: brandCreatedAt,
      brand_approved_by: "auto"
    };
    const payload: CreateTicketBodyRequest = {
      data: ticketBody,
      agent: env.boc.agent,
      token: md5Hash(`${env.boc.agent}${env.boc.apiKey}${ticketBody.id}`),
    };
    return payload;
  }

  private async sendPaymentTicketAndUpdateTransferCode(paymentTicket: PaymentTicket, order: Order) {
    const payload = await this.getPaymentTicketPayload(paymentTicket, order);
    try {
      this.log.debug(`[sendPaymentTicketAndUpdateTransferCode] Start send payment ticket payload: ${JSON.stringify(payload)}`);
      const { data } = await axios.post<CreateTicketResponse>(`${env.boc.apiUrl}/transfer-brand/tickets`, payload);
      if (!data.success) {
        throw new Error(data.message);
      }
      await this.paymentTicketRepository.updatePaymentTicketTransferCode(paymentTicket.id, data.transfer_code);
      this.log.debug(`[sendPaymentTicketAndUpdateTransferCode] success: ${data.transfer_code} payload: ${JSON.stringify(payload)}`);
    } catch (error: any) {
      this.log.error(`[sendPaymentTicketAndUpdateTransferCode] Error: ${error}`);
      throw new P2PError(OrderLifeCycleError.CREATE_PAYMENT_TICKET_IS_FAILED);
    }
  }

  public async confirmSentTransaction(order: Order, paymentMethodId: string, isTempPayment: boolean): Promise<void> {
    try {
      this.log.debug('Start implement confirmSentTransaction method for: ', order.id);
      const masterDataCommon = order.configuration ?? (await this.sharedMasterDataService.getLatestMasterDataCommon());
      const payment = await this.sharedPaymentMethodService.getPaymentMethodById(paymentMethodId);
      const paymentInfo: PaymentInfo = {
        paymentMethodId,
        bankAccountName: payment?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER),
        bankAccountNumber: payment?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER),
        bankName: payment?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME),
      };
      const payload: Partial<Order> = {
        status: OrderStatus.PAID,
        step: SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
        endedTime: moment.utc().add(masterDataCommon.merchantToUserTimeBuy, 'minutes').toDate(),
        paymentInfo,
        isPaymentFromAnotherAccount: isTempPayment,
      };
      await this.merchantOrderService.update(order.id, payload);
      this.log.debug('[confirmSentTransaction] Start updateOrderStatistic ', order.id);
      await this.sharedStatisticService.updateOrderStatistic(
        order,
        SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME
      );
      if (order.appealId) {
        await this.sharedAppealService.pending(order.appealId);
      }
      order = this.merchantOrderService.mergePayload(order, payload);
      this.eventDispatcher.dispatch(events.actions.order.sell.merchantConfirmSentPayment, order);
    } catch (error) {
      throw new P2PError(OrderLifeCycleError.FIAT_CONFIRMATION_IS_FAILED);
    }
  }
}
