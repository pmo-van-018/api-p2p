import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { Order } from '@api/order/models/Order';
import { Operation } from '@api/profile/models/Operation';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { ErrorInfo } from '@api/infrastructure/helpers/ErrorInfo';
import { IParticipantRole, ParticipantRole, addNewMember } from '@base/utils/chat.utils';

@Service()
export class GetTransactionFailedDetailUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  
  public async getDetail(currentUser: Operation, orderRefId: string): Promise<Order | ErrorInfo>{
    this.log.debug('Start implement GetTransactionFailedDetailUseCase getDetail for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.userOrderService.getFullSellOrdeByRefId(orderRefId);
    if (!order) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    const error = this.userOrderService.validateOrderBeforeConfirmTransaction(order, currentUser);
    if (error) {
      return error;
    }
    const participants: IParticipantRole[] = [
      {
        userId: currentUser.peerChatId,
        role: ParticipantRole.MEMBER,
      },
    ];
    await addNewMember({
      roomId: order.roomId,
      participants,
    });
    this.log.debug('End implement GetTransactionFailedDetailUseCase getDetail for: ', currentUser.type, currentUser.walletAddress);
    return order;
  }
}
