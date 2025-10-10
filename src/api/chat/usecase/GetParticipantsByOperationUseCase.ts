import { OperationType, ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Service } from 'typedi';
import { ChatError } from '@api/chat/errors/ChatError';
import { Operation } from '@api/profile/models/Operation';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { Order } from '@api/order/models/Order';

@Service()
export class GetParticipantsByOperationUseCase {
  constructor(
    private orderService: SharedOrderService
  ) {}
  public async getParticipants(currentUser: Operation, orderRefId: string): Promise<any> {
    const order = await this.orderService.getParticipants(orderRefId);
    if (!order) {
      return ChatError.ORDER_NOT_FOUND;
    }

    if (!this.isValidPermission(order, currentUser.id, currentUser.type)) {
      return ChatError.PERMISSION_DENIED;
    }

    const rolesVisibleChat: number[] = [
      OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER,
      OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER,
      OperationType.MERCHANT_MANAGER,
    ];

    return {
      roomId: order.roomId,
      participants: [
        {
          nickName: order.user.nickName,
          peerChatId: order.user.peerChatId,
          role: rolesVisibleChat.includes(currentUser.type)
            ? ROLE_TYPE.USER : null,
        },
        {
          nickName: order.merchant.merchantManager.nickName,
          peerChatId: order.merchant.peerChatId,
          role: rolesVisibleChat.includes(currentUser.type)
            ? ROLE_TYPE.MERCHANT_OPERATOR : null,
        },
        (order.supporter && {
          nickName: order.merchant.merchantManager.nickName,
          peerChatId: order.supporter.peerChatId,
          role: rolesVisibleChat.includes(currentUser.type)
            ? ROLE_TYPE.MERCHANT_SUPPORTER : null,
        }),
      ],
    };
  }

  public isValidPermission(order: Order, userId: string, userType: OperationType) {
    return (
      (userType === OperationType.MERCHANT_MANAGER && order?.merchant?.merchantManagerId === userId) ||
      (userType === OperationType.MERCHANT_OPERATOR && order?.merchantId === userId) ||
      (userType === OperationType.MERCHANT_SUPPORTER && order?.supporterId === userId) ||
      (userType === OperationType.SUPER_ADMIN) ||
      (userType === OperationType.ADMIN_SUPPORTER && (!order.appeal || order.appeal?.adminId === userId))
    );
  }
}
