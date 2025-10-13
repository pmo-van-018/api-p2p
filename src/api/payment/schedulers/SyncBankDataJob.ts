import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { BankSyncService } from '@api/payment/services/BankSyncService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { Service } from 'typedi';

@Service()
export default class SyncBankDataJob implements JobInterface {
  public cronTime: string;
  public cronOptions: CronOptions;

  constructor(
    private readonly bankSyncService: BankSyncService,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    this.cronTime = env.cronJob.syncBankData;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    this.log.info(`[SyncBankDataJob] Starting bank data synchronization with cronTime: ${this.cronTime}`);

    try {
      const bankData = await this.bankSyncService.syncBankData();
      this.log.info(`[SyncBankDataJob] Successfully synchronized ${bankData.length} banks`);
    } catch (error) {
      this.log.error('[SyncBankDataJob] Failed to synchronize bank data', error);
    }

    this.log.info('[SyncBankDataJob] Bank data synchronization completed');
  }
}

