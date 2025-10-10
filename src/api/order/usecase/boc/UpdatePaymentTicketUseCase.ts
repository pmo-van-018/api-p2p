import { AppealStatus } from '@api/appeal/models/Appeal';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { P2PError } from '@api/common/errors/P2PError';
import { PaymentTicketStatus } from '@api/order/enums/PaymentTicketEnum';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { Order, OrderStatus } from '@api/order/models/Order';
import { PaymentTicket } from '@api/order/models/PaymentTicket';
import { BocRequestBodyDto } from '@api/order/requests/BocUpdateTicketRequest';
import { SharedSellOrderService } from '@api/order/services/order/sell';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { RedlockUtil } from '@base/utils/redlock';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked/dist';

@Service()
export class UpdatePaymentTicketUseCase {
  constructor(
    private sharedPostService: SharedPostService,
    private sharedSellOrderService: SharedSellOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updatePaymentTicket(body: BocRequestBodyDto) {
    const orderId = body.data?.ID;
    const status = body.data?.status;
    try {
      this.log.debug(`Start implement updatePaymentTicket method for: ${orderId} with status: ${status}`);
      const ticket = await this.sharedSellOrderService.getPaymentTicketWithLock(orderId);
      if (!ticket) {
        this.log.info(`[updatePaymentTicket] Ticket not found: ${orderId}`);
        throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_NOT_FOUND);
      }

      // Avoid duplicate update
      if (ticket.status === status) {
        this.log.info(`[updatePaymentTicket] Ticket has been updated: ${orderId}`);
        return;
      }

      const order = await this.sharedSellOrderService.getFullInfoById(ticket.orderId);
      if (!order) {
        this.log.info(`[updatePaymentTicket] Order not found: ${ticket.orderId}`);
        throw new P2PError(OrderLifeCycleError.ORDER_NOT_FOUND);
      }
      switch (status) {
        case PaymentTicketStatus.COMPLETED:
          await this.handleComplete(order, ticket);
          await this.sharedSellOrderService.savePaymentTicketLog(ticket.id, body);
          break;
        case PaymentTicketStatus.PICKED:
          await this.handlePickup(order, ticket);
          await this.sharedSellOrderService.savePaymentTicketLog(ticket.id, body);
          break;
        case PaymentTicketStatus.CANCEL:
          await this.handleCancel(order, ticket);
          await this.sharedSellOrderService.savePaymentTicketLog(ticket.id, body);
          break;
        default:
          this.log.info(`[updatePaymentTicket] Invalid status: ${status}`);
          throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID);
      }
      this.log.debug('Stop implement updatePaymentTicket method for: ', orderId);
      return;
    } catch (error) {
      this.log.error(`Error in updatePaymentTicket method for: ${orderId}`, error);
      if (error instanceof P2PError) {
        throw error;
      }
      throw new P2PError(OrderLifeCycleError.UPDATE_PAYMENT_TICKET_IS_FAILED);
    }
  }

  private async handleComplete(order: Order, ticket: PaymentTicket) {
    this.log.debug('Start implement handleOrderComplete method for order id: ', order.id);
    if (ticket.status !== PaymentTicketStatus.PICKED) {
      this.log.info(`[handleComplete] Ticket completed but status is not PICKED: ${order.id}`);
      throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID);
    }
    await this.sharedSellOrderService.completePaymentTicket(ticket.id);
    if (order.isStatusNotEqual(OrderStatus.PAID)) {
      this.log.info(`[handleComplete] Order is not PAID: ${order.id}`);
      return;
    }
    if (order.appeal && order.appeal.status === AppealStatus.OPEN) {
      this.log.info(`[handleComplete] Order has appeal pending: ${order.id}`);
      return;
    }
    await RedlockUtil.lock(this.sharedPostService.getKeyPostLock(order.postId), async () => {
      await this.sharedSellOrderService.confirmSentTransaction(order, ticket.paymentMethodId, false);
    });
    this.log.debug('Stop implement handleComplete method for: ', order.id);
  }

  private async handlePickup(order: Order, ticket: PaymentTicket) {
    this.log.debug('Start implement handlePickup method for: ', order.id);
    if (ticket.status !== PaymentTicketStatus.NEW) {
      this.log.info(`[handlePickup] Ticket has been picked but status is not NEW: ${order.id}`);
      throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID);
    }
    await this.sharedSellOrderService.pickUpPaymentTicket(ticket.id);
    ticket.status = PaymentTicketStatus.PICKED;
    order.paymentTickets = [ticket];
    this.eventDispatcher.dispatch(events.actions.order.sell.merchantPickPaymentTicket, order);
    this.log.debug('End implement handlePickup method for: ', order.id);
  }

  private async handleCancel(order: Order, ticket: PaymentTicket) {
    this.log.debug('Start implement handleCancel method for: ', order.id);
    if (ticket.status === PaymentTicketStatus.COMPLETED) {
      this.log.info(`[handleCancel] Ticket has been cancelled but status is COMPLETED: ${order.id}`);
      throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID);
    }
    await this.sharedSellOrderService.cancelPaymentTicket(ticket.id);
    ticket.status = PaymentTicketStatus.CANCEL;
    order.paymentTickets = [ticket];
    this.eventDispatcher.dispatch(events.actions.order.sell.merchantCancelPaymentTicket, order);
    this.log.debug('End implement handleCancel method for: ', order.id);
  }
}
