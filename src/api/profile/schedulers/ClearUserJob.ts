import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { env } from '@base/env';
import { Service } from 'typedi';

@Service()
export default class ClearUserJob implements JobInterface {
  public cronTime: string;
  public cronOptions: CronOptions;

  constructor(private _profileService: SharedProfileService) {
    this.cronTime = env.cronJob.clearUserNotHasOrder;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    if (env.dayClearUser.enable) {
      await this._profileService.clearUserNotHasOrder();
    }
  }
}
