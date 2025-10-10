import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Statistic } from '@api/statistic/models/Statistic';
import { StatisticRepository } from '@api/statistic/repositories/StatisticRepository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class BaseStatisticService {
  constructor(
    protected profileService: SharedProfileService,
    @InjectRepository() protected statisticRepository: StatisticRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  public async getMerchantStatistic(operationId: string): Promise<Statistic> {
    return await this.statisticRepository.findOne({ operationId });
  }

  public async getMerchantManagerStatistic(managerId: string): Promise<Statistic> {
    return await this.statisticRepository.findOperatorStatisticByManager(managerId);
  }

  public async getOrCreateStatisticByUserId(userId: string): Promise<Statistic> {
    this.log.debug(`Start implement getOrCreateStatisticByUserId for user ${userId}`);
    let statistic = await this.statisticRepository.findOne({ where: { userId } });
    if (!statistic) {
      const newStatistic = this.statisticRepository.create({ userId });
      statistic = await this.statisticRepository.save(newStatistic);
      await this.profileService.updateByUserId(userId, {
        statisticId: statistic.id,
      });
    }
    this.log.debug(`Stop implement getOrCreateStatisticByUserId for user ${userId}`);
    return statistic;
  }

  public async getOrCreateStatisticByOperationId(operationId: string): Promise<Statistic> {
    this.log.debug(`Start implement getOrCreateStatisticByOperationId for operation ${operationId}`);
    let statistic = await this.statisticRepository.findOne({ where: { operationId } });
    if (!statistic) {
      const newStatistic = this.statisticRepository.create({ operationId });
      statistic = await this.statisticRepository.save(newStatistic);
      await this.profileService.updateByOperatorId(operationId, {
        statisticId: statistic.id,
      });
    }
    this.log.debug(`Stop implement getOrCreateStatisticByOperationId for operation ${operationId}`);
    return statistic;
  }

}
