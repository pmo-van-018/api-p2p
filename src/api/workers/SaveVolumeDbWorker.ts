import { Service } from 'typedi';
import { WorkerInterface } from '@api/workers/WorkerInterface';
import { Subject, Observable, of } from 'rxjs';
import { Volume } from '@api/statistic/models/Volume';
import { ServiceSaveVolumeDbHelper } from '@api/infrastructure/helpers/ServiceSaveVolumeDb';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export default class SaveVolumeDbWorker implements WorkerInterface {
  private subject: Subject<any>;
  private volumeMap: Map<string, Volume> = new Map<string, Volume>();
  private serviceSaveVolumeDbHelper: ServiceSaveVolumeDbHelper;

  constructor(
    @Logger(__filename) private log: LoggerInterface,
    protected sharedOperationService: SharedProfileService,
    public volumeService: VolumeService,
    public statisticService: StatisticService
  ) {
    this.serviceSaveVolumeDbHelper = new ServiceSaveVolumeDbHelper(
      sharedOperationService,
      log,
      volumeService,
      statisticService
    );
  }

  public setData(volume?: Volume): void {
    this.volumeMap.set(volume.id, volume);
    throw new Error('Method not implemented.');
  }

  public async stop(): Promise<Observable<any>> {
    this.log.info('+++ Stopping SaveVolumeDbWorker +++');
    return this.subject || of();
  }

  public async start(): Promise<Observable<any>> {
    this.log.info('+++ Start SaveVolumeDbWorker +++');
    await this.serviceSaveVolumeDbHelper.saveVolumeDb();
    return this.subject;
  }
}
