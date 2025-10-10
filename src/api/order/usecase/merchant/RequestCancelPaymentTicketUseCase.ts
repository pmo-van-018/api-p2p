import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { Operation } from '@api/profile/models/Operation';
import { SharedSellOrderService } from '@api/order/services/order/sell/SharedOrderService';
import { OrderRefIdRequest } from '@api/order/requests/OrderRefIdRequest';
import { PaymentTicketStatus } from '@api/order/enums/PaymentTicketEnum';
import { P2PError } from '@api/common/errors/P2PError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { events } from '@api/subscribers/events';

@Service()
export class RequestCancelPaymentTicketUseCase {
  constructor(
    private sharedSellOrderService: SharedSellOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async requestCancel(
    currentUser: Operation,
    body: OrderRefIdRequest
  ): Promise<OrderLifeCycleError | void> {
    try {
      this.log.debug('Start implement requestCancelPaymentTicket method for: ', currentUser.type, currentUser.walletAddress);
      const { orderId } = body;
      const ticket = await this.sharedSellOrderService.getPaymentTicketWithLock(orderId);
      if (!ticket || ticket.order.merchantId !== currentUser.id) {
        return OrderLifeCycleError.PAYMENT_TICKET_NOT_FOUND;
      }
      if (ticket.status !== PaymentTicketStatus.NEW) {
        return OrderLifeCycleError.PAYMENT_TICKET_STATUS_IS_INVALID;
      }
      await this.sharedSellOrderService.requestCancelPaymentTicket(ticket, currentUser.walletAddress);
      await this.sharedSellOrderService.cancelPaymentTicket(ticket.id);
      const order = await this.sharedSellOrderService.getFullInfoById(ticket.orderId);
      ticket.status = PaymentTicketStatus.CANCEL;
      order.paymentTickets = [ticket];
      this.eventDispatcher.dispatch(events.actions.order.sell.merchantCancelPaymentTicket, order);
      this.log.debug('End implement requestCancelPaymentTicket method for: ', currentUser.type, currentUser.walletAddress);
    } catch (error) {
      this.log.error('Error in requestCancelPaymentTicket method for: ', currentUser.type, currentUser.walletAddress, error);
      if (error instanceof P2PError) {
        throw error;
      }
      throw new P2PError(OrderLifeCycleError.CANCEL_PAYMENT_TICKET_IS_FAILED);
    }
  }
}
