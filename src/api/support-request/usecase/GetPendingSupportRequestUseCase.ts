import { User } from '@api/profile/models/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';

@Service()
export class GetPendingSupportRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getPendingRequest(currentUser: User) {
    this.log.debug(`Start implement getPendingRequest for: ${currentUser.id}`);
    const pendingSupportRequest = await this.supportRequestService.getPendingSupportRequestByUser(currentUser.id);
    this.log.debug(`Stop implement createSupportRequest for: ${currentUser.id}`);
    return pendingSupportRequest;
  }
}
