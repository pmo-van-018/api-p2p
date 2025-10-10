import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { ServiceSaveVolumeDbHelper } from '@api/infrastructure/helpers/ServiceSaveVolumeDb';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

export default class VolumeDataJob implements JobInterface {
  public cronTime: string;
  public cronOptions: CronOptions;
  private serviceSaveVolumeDbHelper: ServiceSaveVolumeDbHelper;

  constructor(
    @Logger(__filename) public log: LoggerInterface,
    protected sharedOperationService: SharedProfileService,
    public volumeService: VolumeService,
    public statisticService: StatisticService
  ) {
    this.cronTime = `0 0 */${env.cronJob.updateVolumeDataByDay} * *`;
    this.cronOptions = {};
    this.serviceSaveVolumeDbHelper = new ServiceSaveVolumeDbHelper(
      sharedOperationService,
      log,
      volumeService,
      statisticService
    );
  }

  public async execute(): Promise<void> {
    await this.serviceSaveVolumeDbHelper.saveVolumeDb();
  }
}
