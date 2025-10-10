import { Service } from 'typedi';

import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { env } from '@base/env';

@Service()
export default class HandleMissingTransactionJob implements JobInterface {
  public cronTime: string;

  public cronOptions: CronOptions;

  constructor(private cryptoTransactionService: CryptoTransactionService) {
    this.cronTime = env.cronJob.handleMissingTransaction;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    await this.cryptoTransactionService.handleMissingTransaction();
  }
}
