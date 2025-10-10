import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { OrderError } from '@api/order/errors/OrderError';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { events } from '@api/subscribers/events';
import { BaseOrderService } from '@api/order/services/order/BaseOrderService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

@Service()
export class ResolveAppealOrderUseCase {
  constructor(
    private baseOrderService: BaseOrderService,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async resolveAppealOrder(currentUser: Operation, orderRefId: string) {
    this.log.debug('Start implement resolveAppealOrder method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.baseOrderService.getFullInfoByRefId(orderRefId);

    if (!order || order.merchant.merchantManagerId !== currentUser.merchantManagerId) {
      return OrderError.ORDER_NOT_FOUND;
    }
    if (!order.supporterId || order.supporterId !== currentUser.id) {
      return OrderLifeCycleError.RESOLVE_APPEAL_PERMISSION_DENIED;
    }
    if (order.appealResolved) {
      return OrderLifeCycleError.APPEAL_ALREADY_RESOLVED;
    }

    await this.baseOrderService.update(order.id, {
      appealResolved: true,
    });
    // dispatch event to handle other tasks in background
    this.eventDispatcher.dispatch(events.actions.appeal.supporterResolveAppealOrder, { orderId: order.id });
    this.log.debug('Stop implement resolveAppealOrder method for: ', currentUser.type, currentUser.walletAddress);
    return null;
  }
}
