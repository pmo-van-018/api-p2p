import { AppealRepository } from '@api/appeal/repositories/AppealRepository';
import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { env } from '@base/env';
import { Service } from 'typedi';
import { IsolationLevel, Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export default class ClearSecretKeyAppealJob implements JobInterface {
  public cronTime: string;
  public cronOptions: CronOptions;
  public clearAfterDays: number;

  constructor(@InjectRepository() private readonly appealRepository: AppealRepository) {
    this.cronTime = env.telegramBot.cronTimeToClearSecretKey;
    this.cronOptions = {};
    this.clearAfterDays = env.telegramBot.clearAfterDays;
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  public async execute(): Promise<void> {
    await this.appealRepository.clearSecretKeyOfClosedAppealAfterDays(this.clearAfterDays);
  }
}
