import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { createChatRoom, IParticipantRole, ParticipantRole } from '@base/utils/chat.utils';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { TradeType } from '@api/common/models';

@Service()
export class ContactMerchantOrderUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedProfileService: SharedProfileService,
    private sharedAppealService: SharedAppealService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async contact(currentUser: User, orderRefId: string, type: TradeType) {
    this.log.debug('Start implement ContactMerchantOrderUseCase for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.type !== type) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.userId !== currentUser.id) {
      return OrderLifeCycleError.APPEAL_PERMISSION_DENIED;
    }
    if (!order.isEnableAppeal()) {
      return OrderLifeCycleError.APPEAL_IS_DISABLED;
    }
    if (!order.roomId) {
      this.log.debug(
        '[requestAppeal] createOrderChatRoom: ',
        order.refId,
        order.user.peerChatId,
        order.merchant.peerChatId
      );
      const participants: IParticipantRole[] = [
        {
          userId: order.user?.peerChatId,
          role: ParticipantRole.MEMBER,
        },
        {
          userId: order.merchant?.peerChatId,
          role: ParticipantRole.MEMBER,
        },
      ];
      const roomId = await createChatRoom(order.refId, participants);
      order.roomId = roomId;
      this.log.debug('[requestAppeal] updateOrder: ', order.id, roomId);
      const affected = await this.userOrderService.updateRoomId(order.id, roomId);
      if (affected === 0) {
        return OrderLifeCycleError.ORDER_HAS_ROOM_CHAT_ALREADY;
      }
    }
    if (!order.appealId) {
      const appeal = await this.sharedAppealService.createAppeal();
      if (!appeal) {
        return OrderLifeCycleError.CREATE_APPEAL_FAILED;
      }

      this.log.debug('[requestAppeal] updateOrderResult: ', order.id, appeal.id);
      const affected = await this.userOrderService.updateAppealId(order.id, appeal.id);

      // prevent double side effect
      if (affected === 0) {
        return OrderLifeCycleError.CREATE_APPEAL_FAILED;
      }

      order.appealId = appeal.id;
      order.appeal = appeal;
    }
    this.log.debug('[requestAppeal] sendSystemNotification: ', order.id, order.appealId);
    await sendSystemNotification(order);
    this.eventDispatcher.dispatch([
      type === TradeType.BUY ?
        events.actions.order.buy.systemUpdateStep :
        events.actions.order.sell.systemUpdateStepOrder,
    ], order);
    const supporters = await this.sharedProfileService.findAllSupportersByManagerId(order.merchant?.merchantManagerId);
    this.eventDispatcher.dispatch([events.actions.appeal.userAgreeToMerchant], {order, supporters});
    this.log.debug('Stop implement ContactMerchantOrderUseCase method for: ', currentUser.type, currentUser.walletAddress);
    return order.appeal;
  }
}
