import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';
import { SupportRequestError } from '@api/support-request/errors/SupportRequestError';
import { OperationType } from '@api/common/models';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetSupportRequestDetailUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getRequestDetail(currentUser: Operation, requestId: string) {
    this.log.debug(`Start implement getPendingRequest for: ${currentUser.id}`);
    const supportRequest = await this.supportRequestService.getSupportRequestByRefId(requestId);
    if (!supportRequest) {
      return SupportRequestError.SUPPORT_REQUEST_NOT_FOUND;
    }
    if (currentUser.type === OperationType.ADMIN_SUPPORTER && currentUser.id !== supportRequest.adminId) {
      return SupportRequestError.ADMIN_SUPPORTER_VIEW_SUPPORT_REQUEST_PERMISSION_DENIED;
    }
    this.log.debug(`Stop implement getPendingRequest for: ${currentUser.id}`);
    return supportRequest;
  }
}
