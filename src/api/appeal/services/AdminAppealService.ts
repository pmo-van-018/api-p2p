import { AppealStatus, BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import moment from 'moment';
import { Service } from 'typedi';
import { Not } from 'typeorm';
import { BaseAppealService } from '@api/appeal/services/BaseAppealService';
import { AdminFindConditions, CloseAppeal } from '@api/appeal/types/Appeal';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AppealRepository } from '@api/appeal/repositories/AppealRepository';

@Service()
export class AdminAppealService extends BaseAppealService {
  constructor(
    @InjectRepository() public appealRepository: AppealRepository
  ) {
    super(appealRepository);
  }
  public async getListAppeal(findConditions: AdminFindConditions) {
    return await this.appealRepository.getListAppeal(findConditions);
  }

  public async addMoreTime(appealId: string, evidentTimeoutAt: Date) {
    const payload = {
      completedAt: evidentTimeoutAt,
      addExtraAt: new Date(),
    };
    await this.appealRepository.update(appealId, {
      ...payload,
      numberOfExtension: () => 'number_of_extension + 1',
    });
    return payload;
  }

  public async closeAppeal(id: string, closeAppealData: CloseAppeal): Promise<void> {
    closeAppealData.status = AppealStatus.CLOSE;
    closeAppealData.actualCloseAt = moment.utc().toDate();
    await this.appealRepository.update(id, closeAppealData);
  }

  public async updateAppealResult(id: string, decisionResult: BUY_APPEAL_RESULTS | SELL_APPEAL_RESULTS): Promise<void> {
    await this.appealRepository.update(id, {
      decisionResult,
      decisionAt: moment.utc().toDate(),
    });
  }

  public async countPickedAppeal(adminId: string) {
    return this.appealRepository.count({
      where: {
        status: Not(AppealStatus.CLOSE),
        adminId,
      },
    });
  }

  public async setAdminSupporter(appealId: string, adminId: string): Promise<void> {
    await this.appealRepository.update(appealId, { adminId });
  }
}
