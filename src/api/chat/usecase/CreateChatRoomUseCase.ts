import { ChatError } from '@api/chat/errors/ChatError';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Service } from 'typedi';
import { TradeType } from '@api/common/models';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { BUY_ORDER_STEPS, SELL_ORDER_STEP } from '@api/order/models/Order';
import { IParticipantRole, ParticipantRole, createChatRoom } from '@base/utils/chat.utils';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';

@Service()
export class CreateChatRoomUseCase {
  constructor(
    private orderService: SharedOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}
  public async createChatRoom(orderId: string, operationId: string) {
    const order = await this.orderService.getFullInfoById(orderId);

    if (!order || order.merchantId !== operationId) {
      return ChatError.ORDER_NOT_FOUND;
    }

    // check if order has room chat already
    if (order.roomId) {
      return ChatError.ROOM_IS_EXISTED;
    }

    // check if order is buy and is in correct step
    if (
      order.type === TradeType.BUY &&
      ![
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      ].includes(order.step) ) {
      return ChatError.OPERATOR_CANNOT_CREATE_ROOM_CHAT;
    }

    // check if order is sell and is in correct step
    if (
      order.type === TradeType.SELL &&
      ![
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      ].includes(order.step) ) {
      return ChatError.OPERATOR_CANNOT_CREATE_ROOM_CHAT;
    }

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

    await this.orderService.updateChatRoom(order.id, roomId);

    // attach roomId to prevent fetching order again
    order.roomId = roomId;

    const eventName = order.type === TradeType.BUY
      ? events.actions.order.buy.operatorCreateChatRoom
      : events.actions.order.sell.operatorCreateChatRoom;
    await sendSystemNotification(order);
    // emit room created to user
    this.eventDispatcher.dispatch(eventName, order);

    return roomId;
  }
}
