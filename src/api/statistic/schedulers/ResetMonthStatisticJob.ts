import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { env } from '@base/env';
import { Service } from 'typedi';

@Service()
export default class ResetMonthStatisticJob implements JobInterface {
  public cronTime: string;

  public cronOptions: CronOptions;

  constructor(private statisticService: StatisticService) {
    this.cronTime = env.cronJob.resetMonthStatistic;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    await this.statisticService.resetMonthStatistic();
  }
}
