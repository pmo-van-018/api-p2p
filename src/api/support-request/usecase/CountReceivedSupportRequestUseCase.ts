import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { SupportRequestService } from '@api/support-request/services/SupportRequestService';

@Service()
export class CountReceivedSupportRequestUseCase {
  constructor(
    private supportRequestService: SupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async countReceivedRequests(operationId: string) {
    this.log.debug(`Start implement countReceivedRequests for: ${operationId}`);
    const count = await this.supportRequestService.countSupportRequestReceived(operationId);
    this.log.debug(`Stop implement countReceivedRequests for: ${operationId}`);
    return count;
  }
}
