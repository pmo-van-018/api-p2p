import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { P2PError } from '@api/common/errors/P2PError';
import { PaymentTicketStatus } from '@api/order/enums/PaymentTicketEnum';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { Order } from '@api/order/models/Order';
import { PaymentTicket } from '@api/order/models/PaymentTicket';
import { NotifyTicketHandlerRequest } from '@api/order/requests/BocNotifyTicketHandlerRequest';
import { SharedSellOrderService } from '@api/order/services/order/sell';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked/dist';

@Service()
export class NotifyPaymentTicketHandlerUseCase {
  constructor(
    private sharedSellOrderService: SharedSellOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async notifyPaymentTicketHandler(body: NotifyTicketHandlerRequest) {
    const orderRefId = body.data.id;
    try {
      this.log.debug(`Start implement notifyPaymentTicketHandler method for: ${orderRefId}`);
      const ticket = await this.sharedSellOrderService.getPaymentTicketWithLock(orderRefId);
      if (!ticket) {
        this.log.info(`[notifyPaymentTicketHandler] Ticket not found: ${orderRefId}`);
        throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_NOT_FOUND);
      }

      const order = await this.sharedSellOrderService.getFullInfoById(ticket.orderId);
      if (!order) {
        this.log.info(`[notifyPaymentTicketHandler] Order not found: ${ticket.orderId}`);
        throw new P2PError(OrderLifeCycleError.ORDER_NOT_FOUND);
      }
      await this.handlePickup(order, ticket, body);
      this.log.debug('Stop implement notifyPaymentTicketHandler method for: ', orderRefId);
      return;
    } catch (error) {
      this.log.error(`Error in notifyPaymentTicketHandler method for: ${orderRefId}`, error);
      if (error instanceof P2PError) {
        throw error;
      }
      throw new P2PError(OrderLifeCycleError.UPDATE_PAYMENT_TICKET_IS_FAILED);
    }
  }

  private async handlePickup(order: Order, ticket: PaymentTicket, body: NotifyTicketHandlerRequest) {
    this.log.debug('Start implement handlePickup method for: ', order.id);
    if (ticket.status !== PaymentTicketStatus.NEW) {
      this.log.info(`[handlePickup] Ticket has been picked but status is not NEW: ${order.id}`);
      throw new P2PError(OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID);
    }
    await this.sharedSellOrderService.pickUpPaymentTicket(ticket.id, body.data?.approved_at, body.data?.approved_by);
    ticket.status = PaymentTicketStatus.PICKED;
    order.paymentTickets = [ticket];
    this.eventDispatcher.dispatch(events.actions.order.sell.merchantPickPaymentTicket, order);
    this.log.debug('End implement handlePickup method for: ', order.id);
  }
}
