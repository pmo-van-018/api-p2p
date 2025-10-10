import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { OutBoxService } from '@api/outbox/services/OutBoxService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { Service } from 'typedi';

@Service()
export default class OutBoxProducerJob implements JobInterface {
  public cronTime: string;
  public cronOptions: CronOptions;

  constructor(private readonly outboxService: OutBoxService, @Logger(__filename) protected log: LoggerInterface) {
    this.cronTime = env.cronJob.outBoxProducer;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    this.log.info(`Start implementing OutBoxProducerJob with cronTime: ${this.cronTime}`);
    await this.outboxService.publish(500);
    this.log.info(`Stop implementing OutBoxProducerJob with cronTime: ${this.cronTime}`);
  }
}
