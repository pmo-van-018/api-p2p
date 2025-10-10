import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';
import { Operation } from '@api/profile/models/Operation';
import { OperationType } from '@api/common/models';

@Service()
export class CountPendingRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async countRequest(operation: Operation) {
    this.log.debug(`Start implement countPendingByAdmin for: ${operation.id}`);
    const count = await this.supportRequestService.countPendingByAdmin(operation.type === OperationType.SUPER_ADMIN);
    this.log.debug(`Stop implement countPendingByAdmin for: ${operation.id}`);
    return count;
  }
}
