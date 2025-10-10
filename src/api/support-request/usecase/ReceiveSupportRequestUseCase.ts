import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';
import { SupportRequestError } from '@api/support-request/errors/SupportRequestError';
import { addNewMember, IParticipantRole, ParticipantRole } from '@base/utils/chat.utils';
import { events } from '@api/subscribers/events';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SupportRequestStatus } from '@api/support-request/models/SupportRequestEnum';
import { Operation } from '@api/profile/models/Operation';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

@Service()
export class ReceiveSupportRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    private readonly sharedMasterDataService: SharedMasterDataService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async receive(currentUser: Operation, requestId: string) {
    this.log.debug(`Start implement receive support request for: ${currentUser.id}`);
    const requestReceived = await this.supportRequestService.countSupportRequestReceived(currentUser.id);
    const dataCommon = await this.sharedMasterDataService.getLatestMasterDataCommon();

    if (requestReceived >= Number(dataCommon.supportRequestsReceivingLimit)) {
      return SupportRequestError.TOTAL_REQUEST_PICKED_LIMITS_ARE_EXCEEDED;
    }
    const supportRequest = await this.supportRequestService.getSupportRequestByRefId(requestId);
    if (!supportRequest) {
      return SupportRequestError.SUPPORT_REQUEST_NOT_FOUND;
    }
    if (supportRequest.status !== SupportRequestStatus.PENDING) {
      return SupportRequestError.SUPPORT_REQUEST_STATUS_IS_INVALID;
    }
    if (supportRequest.adminId) {
      return SupportRequestError.SUPPORT_REQUEST_ALREADY_RECEIVED;
    }
    await this.supportRequestService.receiveByAdminSupporter(supportRequest.id, currentUser.id);

    const participants: IParticipantRole[] = [
      {
        userId: currentUser.peerChatId,
        role: ParticipantRole.MEMBER,
      },
    ];
    await addNewMember({
      roomId: supportRequest.roomId,
      participants,
    });
    this.eventDispatcher.dispatch(events.actions.supportRequest.supportRequestPicked, {
      supportRequestId: supportRequest.id,
    });
    this.log.debug(`Stop implement receive support request for: ${currentUser.id}`);
    return null;
  }
}
