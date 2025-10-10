import { AppealError } from '@api/appeal/errors/AppealError';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService'
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';

@Service()
export class GetAppealDetailUseCase {
    constructor(
    private sharedAppealService: SharedAppealService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getAppealDetail(secret: string) {
    this.log.debug('Start implement getAppealDetail method for secret: ', secret);
    const appeal = await this.sharedAppealService.getAppealDetailBySecret(secret);
    if (!appeal) {
      return AppealError.APPEAL_NOT_FOUND;
    }
    this.log.debug('Stop implement getAppealDetail method for secret: ', secret);
    return appeal;
  }
}
