import { Service } from 'typedi';
import { ChatError } from '@api/chat/errors/ChatError';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';

@Service()
export class GetParticipantsByUserUseCase {
  constructor(
    private orderService: SharedOrderService
  ) {}
  public async getParticipants(userId: string, orderRefId: string): Promise<any> {
    const order = await this.orderService.getParticipants(orderRefId);
    if (!order || order.userId !== userId) {
      return ChatError.ORDER_NOT_FOUND;
    }

    if (order.isFinished() || !order.roomId) {
      return ChatError.CHAT_NOT_AVAILABLE;
    }

    return {
      roomId: order.roomId,
      participants: [
        {
          nickName: order.user.nickName,
          peerChatId: order.user.peerChatId,
        },
        {
          nickName: order.merchant.merchantManager.nickName,
          peerChatId: order.merchant.peerChatId,
        },
        (order.supporter && {
          nickName: order.merchant.merchantManager.nickName,
          peerChatId: order.supporter.peerChatId,
        }),
      ],
    };
  }
}
