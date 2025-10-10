import { BaseOrderService } from '@api/order/services/order/BaseOrderService';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { OrderStatus, Order, SELL_ORDER_STEP, BUY_ORDER_STEPS } from '@api/order/models/Order';
import { In } from 'typeorm';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { TradingVolumeByPeriodRequest } from '@api/statistic/requests/TradingVolumeByPeriodRequest';
import { RevenueAndPriceByPeriodRequest } from '@api/statistic/requests/RevenueAndPriceByPeriodRequest';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import {OperationType, TradeType} from '@api/common/models';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {sleep} from '@base/utils/p2p.utils';

export class SharedOrderService extends BaseOrderService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }

  public async setAppeal(id: string, appealId: string, roomId?: string) {
    await this.orderRepository.update(id, { appealId, roomId });
  }

  public async hasProcessingOrderByPaymentMethod(paymentMethodId: string) {
    return !!(await this.orderRepository.findOne({
      where: {
        paymentMethodId,
        status: In([
          OrderStatus.TO_BE_PAID,
          OrderStatus.CONFIRM_PAID,
          OrderStatus.PAID,
        ]),
      },
    }));
  }

  public async hasOrderByPaymentMethod(paymentMethodId: string) {
    return !!(await this.orderRepository.findOne({
      where: {
        paymentMethodId,
      },
      withDeleted: true,
    }));
  }
  public async getFullInfoById(id: string): Promise<Order | null> {
    return await this.orderRepository.getFullInfoById(id);
  }

  public async updateChatRoom(id: string, roomId: string) {
    return this.orderRepository.update(id, { roomId });
  }

  public async getParticipants(orderRefId: string) {
    return this.orderRepository.getParticipants(orderRefId);
  }

  public async countTotalOrderProcessingByRole(currentUser: Operation) {
    return this.orderRepository.countTotalOrderProcessingByRole(currentUser);
  }
  public async countOrderAmountTotalByShift(operationId: string, checkIn: Date, checkOut: Date): Promise<number> {
    const result = await this.orderRepository.countOrderAmountTotalByShift(operationId, checkIn, checkOut);
    return Number(result?.totalPrice) || 0;
  }

  public async getMatchedOrdersByPost({ limit, page, postRefId }: { limit: number, page: number, postRefId: string}) {
    return await this.orderRepository.getMatchedOrdersByPost({ limit, page, postRefId });
  }

  public async getProcessingOrderByUser(userId: string) {
    return await this.orderRepository.findOne({
      where: {
        userId,
        status: In([OrderStatus.TO_BE_PAID, OrderStatus.PAID, OrderStatus.CONFIRM_PAID]),
      },
    });
  }

  public async getOrderHistoryReport(filter: ExportReportRequest, user: Operation | User) {
    return await this.orderRepository.getDataExportOrderHistory(filter, user);
  }

  public async getAssetRevenueReport(filter: ExportReportRequest, user: Operation | User) {
    return await this.orderRepository.calculateRevenueByAsset(filter, user);
  }

  public async getRevenueAllAsset(filter: ExportReportRequest, user: Operation | User, isGroup?: boolean) {
    return await this.orderRepository.calculateRevenueByAllAsset(filter, user, isGroup);
  }

  public async getTradeTypeDifference(filter: ExportReportRequest, user: Operation | User) {
    return await this.orderRepository.tradeTypeDifferenceReportByAsset(filter, user);
  }

  public async getTradingVolumeByPeriod(tradingVolumeByPeriodRequest: TradingVolumeByPeriodRequest) {
    return this.orderRepository.getTradingVolumeByPeriod(tradingVolumeByPeriodRequest.day);
  }

  public async getRevenueAndPriceByPeriod(revenueAndPriceByPeriodRequest: RevenueAndPriceByPeriodRequest) {
    return this.orderRepository.getRevenueAndPriceByPeriod(revenueAndPriceByPeriodRequest);
  }

  public async countOrderAppeal(managerId: string) {
    return this.orderRepository.countOrderHasAppealTotal(managerId);
  }

  public async getUserOrderStatistic(userId: string) {
    return this.orderRepository.getUserOrderStatistic(userId);
  }

  public async removeSupporterId(supporterId: string): Promise<{ affected: number }> {
    const result = await this.orderRepository.update({ supporterId }, { supporterId: null });
    return { affected: result.affected };
  }

  public async getPendingOrderByOperation(operationId: string, type: OperationType) {
    return await this.orderRepository.getPendingOrderByOperation(operationId, type);
  }

  public async getOrderIds(merchantId: string, status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { merchantId, status },
      select: ['refId'],
    });
  }

  public getCountdownSellOrderList(): Promise<Order[]> {
    try {
      const steps = [
        SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
        SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
        SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
      ];
      return this.orderRepository.getCountdownOrderList(steps, TradeType.SELL);
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public getCountdownOrderBuyList(): Promise<Order[]> {
    try {
      const steps = [
        BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER,
        BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      ];
      return this.orderRepository.getCountdownOrderList(steps, TradeType.BUY);
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getSellOrdersByBlackList(): Promise<Order[] | []> {
    try {
      const steps = [
        SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
        SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
        SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
      ];
      return this.orderRepository.getOrdersInBlackList(TradeType.SELL, steps);
    } catch (error: any) {
      this.log.error(error.message);
    }
    return [];
  }

  public async getBuyOrdersByBlackList(): Promise<Order[] | []> {
    try {
      const steps = [
        BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER,
        BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
      ];
      return this.orderRepository.getOrdersInBlackList(TradeType.BUY, steps);
    } catch (error: any) {
      this.log.error(error.message);
    }
    return [];
  }

  public isValidOrderStepMoveToAppeal(step: number, orderType: TradeType): boolean {
    const buySteps = [
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ];
    const sellSteps = [SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME];
    return orderType === TradeType.BUY ? buySteps.includes(step) : sellSteps.includes(step);
  }

  public async countMerchantOrders(merchantId: string, merchantType: OperationType) {
    const finishStatus = [OrderStatus.CANCELLED, OrderStatus.COMPLETED];
    const pendingStatus = [OrderStatus.TO_BE_PAID, OrderStatus.CONFIRM_PAID, OrderStatus.PAID];
    const completeOrder = await this.orderRepository.countByMerchantAndStatus(merchantId, merchantType, finishStatus);
    const pendingOrder = await this.orderRepository.countByMerchantAndStatus(merchantId, merchantType, pendingStatus);
    return { completeOrder, pendingOrder };
  }

  public async wipeCancelOrders(options: { chunk?: number; timeout?: number }): Promise<void> {
    const wipeCancelOrdersQuery = `
      WITH ordersCte as (SELECT orders.id
       FROM orders
       WHERE NOT EXISTS
           (SELECT *
            from crypto_transactions
            WHERE crypto_transactions.order_id = orders.id)
         AND orders.status = ?
         AND orders.appeal_id IS NULL
       limit ?)
      DELETE
      FROM orders
      WHERE id IN (SELECT id FROM ordersCte);
    `;
    const totalCancelOrdersRemainingQuery = `
        SELECT count(*) as total FROM orders
        WHERE NOT EXISTS
            (SELECT *
             from crypto_transactions
             WHERE crypto_transactions.order_id = orders.id)
          AND orders.status = ?
          AND orders.appeal_id IS NULL
        limit ?
    `;

    const chunk = options.chunk ?? 1000;
    const timeout = options.timeout ?? 1000;

    await this.orderRepository.query(wipeCancelOrdersQuery, [OrderStatus.CANCELLED, chunk]);

    const totalRaw = await this.orderRepository.query(totalCancelOrdersRemainingQuery, [OrderStatus.CANCELLED, chunk]);
    const total = +totalRaw[0]['total'];

    if (total) {
      await sleep(timeout);
      await this.wipeCancelOrders(options);
    }
  }
}
