import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderManagementService} from '@api/order/services/order/MerchantOrderManagementService';
import {OrderError} from '@api/order/errors/OrderError';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {addNewMember, IParticipantRole, ParticipantRole} from '@base/utils/chat.utils';
import {events} from '@api/subscribers/events';
import {BaseOrderService} from '@api/order/services/order/BaseOrderService';
import {SharedMasterDataService} from '@api/master-data/services/SharedMasterDataService';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';

@Service()
export class ReceiveAppealOrderUseCase {
  constructor(
    private baseOrderService: BaseOrderService,
    private masterDataService: SharedMasterDataService,
    private merchantOrderManagementService: MerchantOrderManagementService,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async receiveAppealOrder(currentUser: Operation, orderRefId: string) {
    this.log.debug('Start implement receiveAppealOrder method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.baseOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.merchant.merchantManagerId !== currentUser.merchantManagerId) {
      return OrderError.ORDER_NOT_FOUND;
    }
    if (order.supporterId) {
      return OrderLifeCycleError.ORDER_ALREADY_HAS_SUPPORTER;
    }

    this.log.debug('[receiveAppealOrder] countPickedOrder', currentUser.type, currentUser.walletAddress);
    const pickedOrderNumber = await this.merchantOrderManagementService.countPickedOrder(currentUser.id);

    this.log.debug('[receiveAppealOrder] check supportOrders', currentUser.type, currentUser.walletAddress, pickedOrderNumber);
    const masterData = await this.masterDataService.getLatestMasterDataCommon();

    if (pickedOrderNumber >= masterData.appealReceivedBySupporterLimit) {
      return OrderLifeCycleError.TOTAL_ORDER_SUPPORT_LIMITS_ARE_EXCEEDED;
    }

    this.log.debug('[receiveAppealOrder] update supporterId', currentUser.type, currentUser.walletAddress, currentUser.id);
    // assign user to support appeal order
    await this.baseOrderService.update(order.id, {
      supporterId: currentUser.id,
    });
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
    // dispatch event to handle other tasks in background
    this.eventDispatcher.dispatch(events.actions.appeal.supporterReceiveAppealOrder, { orderId: order.id });
    this.log.debug('Stop implement receiveAppealOrder method for: ', currentUser.type, currentUser.walletAddress);
    return null;
  }
}
