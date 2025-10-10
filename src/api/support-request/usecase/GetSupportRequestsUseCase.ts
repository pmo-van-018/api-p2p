import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';
import { SupportRequestListRequest } from '@api/support-request/requests/SupportRequestListRequest';
import { Operation } from '@api/profile/models/Operation';
import { OperationType } from '@api/common/models';

@Service()
export class GetSupportRequestsUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getListRequest(supportRequestList: SupportRequestListRequest, currentUser: Operation) {
    this.log.debug(`Start implement getPendingRequest for: ${currentUser.id}`);
    const [items, totalItems] = await this.supportRequestService.getSupportRequests({
      ...supportRequestList,
      ...(currentUser.type === OperationType.ADMIN_SUPPORTER) && { adminId: currentUser.id },
    });
    this.log.debug(`Stop implement createSupportRequest for: ${currentUser.id}`);
    return { items, totalItems };
  }
}
