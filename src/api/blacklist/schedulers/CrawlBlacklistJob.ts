import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { env } from '@base/env';
import { Service } from 'typedi';
import { BlacklistCronService } from '@api/blacklist/services/BlacklistCronService';

@Service()
export default class CrawlBlacklistJob implements JobInterface {
  public cronTime: string;

  public cronOptions: CronOptions;

  constructor(
    private crawlBlacklistService: BlacklistCronService
  ) {
    this.cronTime = env.blacklist.cron;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    await this.crawlBlacklistService.handleCrawlData();
  }
}
