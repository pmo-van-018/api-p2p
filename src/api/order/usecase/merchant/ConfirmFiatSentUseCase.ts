import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { Operation } from '@api/profile/models/Operation';
import { Order, OrderStatus } from '@api/order/models/Order';
import { P2PError } from '@api/common/errors/P2PError';
import { RedlockUtil } from '@base/utils/redlock';
import { events } from '@api/subscribers/events';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { ConfirmSentFiatRequest } from '@api/order/requests/ConfirmSentFiatRequest';
import { SharedSellOrderService } from '@api/order/services/order/sell/SharedOrderService';

@Service()
export class ConfirmFiatSentUseCase {
  constructor(
    private sharedPostService: SharedPostService,
    private sharedSellOrderService: SharedSellOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async confirmSent(currentUser: Operation, body: ConfirmSentFiatRequest) {
    const { id } = body;
    this.log.debug('Start implement confirmSent method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.sharedSellOrderService.getFullInfoByRefId(id);

    if (!order || order.merchantId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }
    const result = await RedlockUtil.lock(this.sharedPostService.getKeyPostLock(order.postId), async () => {
      const newTicket = await this.handleCreatePaymentTicket(order);
      if (newTicket === OrderLifeCycleError.PAYMENT_TICKET_IS_EXIST) {
        return OrderLifeCycleError.PAYMENT_TICKET_IS_EXIST;
      }
      this.eventDispatcher.dispatch(events.actions.order.sell.merchantCreatePaymentTicket, {
        ...order,
        paymentTickets: [newTicket],
      });
      this.log.debug('Stop implement confirmSent method for: ', currentUser.type, currentUser.walletAddress);
      return newTicket;
    });
    return result;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async handleCreatePaymentTicket(order: Order) {
    try {
      await this.sharedSellOrderService.lockOrderByRefId(order.refId);
      const ticket = await this.sharedSellOrderService.getTicketByOrderId(order.id);
      if (ticket) {
        return OrderLifeCycleError.PAYMENT_TICKET_IS_EXIST;
      }
      return await this.sharedSellOrderService.createPaymentTicket(order);
    } catch (error) {
      if (error instanceof P2PError) {
        throw error;
      }
      throw new P2PError(OrderLifeCycleError.FIAT_CONFIRMATION_IS_FAILED);
    }
  }
}
