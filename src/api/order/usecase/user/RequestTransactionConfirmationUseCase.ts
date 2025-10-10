import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Order } from '@api/order/models/Order';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { TransactionStatus } from '@api/order/models/CryptoTransaction';
import { IParticipantRole, ParticipantRole, createChatRoom } from '@base/utils/chat.utils';
import { events } from '@api/subscribers/events';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';

@Service()
export class RequestTransactionConfirmationUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private cryptoTransactionService: CryptoTransactionService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async requestConfirmation(currentUser: User, orderRefId: string): Promise<OrderLifeCycleError | void>{
    this.log.debug('Start implement requestConfirmation for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.userOrderService.getFullSellOrdeByRefId(orderRefId, currentUser.id);
    if (!order) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    const error = this.userOrderService.validateOrderBeforeConfirmTransaction(order, currentUser);
    if (error) {
      return error;
    }
    const transactionFailed = await this.cryptoTransactionService.findOneWithConditions(
      {
        orderId: order.id,
        status: TransactionStatus.UNKNOWN,
       },
      {
        order: {
          createdAt: 'DESC',
        },
      }
    );
    if (!transactionFailed) {
      return OrderLifeCycleError.TRANSACTION_NOT_FOUND;
    }
    const roomId = await this.createRoomAndSendMessage(order);
    const affectedRow = await this.userOrderService.update(order.id, { roomId })
    if (!affectedRow) {
      return OrderLifeCycleError.ORDER_UPDATE_IS_FAILED;
    }
    this.eventDispatcher.dispatch(events.actions.order.sell.userRequestTransactionConfirmation, order);
    this.log.debug('End implement requestConfirmation for: ', currentUser.type, currentUser.walletAddress);
    return roomId;
  }

  private async createRoomAndSendMessage(order: Order): Promise<string> {
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
    await sendSystemNotification(order);
    return roomId;
  }
}
