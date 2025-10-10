import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';
import { SupportRequestError } from '@api/support-request/errors/SupportRequestError';
import { closeChatRoom } from '@base/utils/chat.utils';
import { events } from '@api/subscribers/events';
import { SupportRequestStatus } from '@api/support-request/models/SupportRequestEnum';
import { Operation } from '@api/profile/models/Operation';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

@Service()
export class ResolveSupportRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async resolve(currentUser: Operation, requestId: string) {
    this.log.debug(`Start implement resolve support request for: ${currentUser.id}`);
    const supportRequest = await this.supportRequestService.getSupportRequestByRefId(requestId);
    if (!supportRequest) {
      return SupportRequestError.SUPPORT_REQUEST_NOT_FOUND;
    }
    if (supportRequest.status !== SupportRequestStatus.PENDING) {
      return SupportRequestError.SUPPORT_REQUEST_STATUS_IS_INVALID;
    }
    if (supportRequest.adminId !== currentUser.id) {
      return SupportRequestError.CANNOT_RESOLVE_SUPPORT_REQUEST;
    }
    await this.supportRequestService.resolveRequest(supportRequest.id);
    await closeChatRoom({
      roomId: supportRequest.roomId,
    });
    this.eventDispatcher.dispatch(events.actions.supportRequest.resolvedSupportRequest, {
      user: supportRequest.user,
    });
    this.log.debug(`Stop implement resolve support request for: ${currentUser.id}`);
    return null;
  }
}
