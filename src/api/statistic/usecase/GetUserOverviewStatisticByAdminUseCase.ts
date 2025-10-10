import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { StatisticError } from '@api/statistic/errors/StatisticError';
import { GetStatisticByUserUseCase } from '@api/statistic/usecase/GetStatisticByUserUseCase';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class GetUserOverviewStatisticByAdminUseCase {
  constructor(
    private sharedUserService: SharedProfileService,
    private getStatisticByUserUseCase: GetStatisticByUserUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOverviewStatistic(userId: string) {
    this.log.debug(`Start implement getOverviewStatistic: ${userId}`);
    const user = await this.sharedUserService.getUserById(userId);
    if (!user) {
      return StatisticError.USER_NOT_FOUND;
    }
    const result = await this.getStatisticByUserUseCase.getStatistic(user);

    this.log.debug(`Stop implement getStatisticByUer: ${userId}`);

    return result;
  }
}
