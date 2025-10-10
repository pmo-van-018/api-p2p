import { User } from '@api/profile/models/User';
import { events } from '@api/subscribers/events';
import { SupportRequestError } from '@api/support-request/errors/SupportRequestError';
import { SupportRequest } from '@api/support-request/models/SupportRequest';
import { CreateNewSupportRequest } from '@api/support-request/requests/CreateNewSupportRequest';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { IParticipantRole, ParticipantRole, createChatRoom } from '@base/utils/chat.utils';
import { generateRefId } from '@base/utils/helper.utils';
import { plainToInstance } from 'class-transformer';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';

@Service()
export class CreateSupportRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createSupportRequest(data: CreateNewSupportRequest, currentUser: User) {
    this.log.debug(`Start implement createSupportRequest for: ${currentUser.id}`);
    const pendingSupportRequest = await this.supportRequestService.getPendingSupportRequestByUser(currentUser.id);
    if (pendingSupportRequest) {
      return SupportRequestError.EXISTING_REQUEST_SUPPORT;
    }
    const refId = generateRefId();
    const participants: IParticipantRole[] = [
      {
        userId: currentUser.peerChatId,
        role: ParticipantRole.MEMBER,
      },
    ];
    const roomId = await createChatRoom(refId, participants);
    const newSupportRequest = plainToInstance(SupportRequest, {
      userId: currentUser.id,
      type: data.type,
      refId,
      roomId,
    });
    const supportRequest = await this.supportRequestService.saveSupportRequest(newSupportRequest);
    this.eventDispatcher.dispatch(events.actions.supportRequest.createNewSupportRequest, {
      userName: currentUser.nickName,
    });
    this.log.debug(`Stop implement createSupportRequest for: ${currentUser.id}`);
    return supportRequest;
  }
}
