import { AppealRepository } from '@api/appeal/repositories/AppealRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseAppealService } from '@api/appeal/services/BaseAppealService';
import { Appeal, AppealStatus } from '@api/appeal/models/Appeal';
import moment from 'moment';
import { closeAppealMessage } from '@base/utils/chat.utils';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { generateSecretCode } from '@base/utils/helper.utils';
import { Not } from 'typeorm';

export class SharedAppealService extends BaseAppealService {
  constructor(
    @InjectRepository() public appealRepository: AppealRepository,
    private sharedMasterDataService: SharedMasterDataService
  ) {
    super(appealRepository);
  }

  public async closeBySystem(appealId: string): Promise<void> {
    const appeal: Appeal = await this.getAppealById(appealId, true);
    if (appeal) {
      await this.appealRepository.update(appealId, {
        status: AppealStatus.CLOSE,
        actualCloseAt: moment.utc().toDate(),
        decisionAt: moment.utc().toDate(),
      });
      closeAppealMessage(appeal.order.roomId);
    }
  }

  public async pending(appealId: string): Promise<void> {
    await this.appealRepository.update(appealId, { status: AppealStatus.PENDING });
  }

  public async openAppeal(appealId: string): Promise<void> {
    await this.appealRepository.update(
      appealId,
      {
        secret: generateSecretCode('APPEAL_'),
        status: AppealStatus.OPEN,
        openAt: moment.utc().toDate(),
      }
    );
  }

  // TODO: cover api v1 (need remove when migrate to v2 completed)
  public async createAppeal(): Promise<Appeal | null> {
    const masterData = await this.sharedMasterDataService.getLatestMasterDataCommon();
    const openAppealTime = masterData?.evidenceProvisionTimeLimit;
    const openAt = moment.utc().toDate();
    const closeAt = moment.utc().add(openAppealTime, 'minutes').toDate();
    const appeal = new Appeal();
    appeal.status = AppealStatus.PREPARE;
    appeal.operationWinnerId = null;
    appeal.userWinnerId = null;
    appeal.createdAt = openAt;
    appeal.openAt = openAt;
    appeal.closeAt = closeAt;
    appeal.completedAt = closeAt;
    appeal.note = null;
    return await this.appealRepository.save(appeal);
  }

  public async countAppealByManagerId(managerId: string): Promise<number> {
    return this.appealRepository.countAppealByManagerId(managerId);
  }

  public async countAppealByStaffIds(merchantIds: string[]) {
    return await this.appealRepository.countAppealByStaffIds(merchantIds);
  }

  public async countAppealByAdmin(adminIds: string[]) {
    return await this.appealRepository
      .createQueryBuilder('appeal')
      .where('appeal.adminId IN (:...ids)', { ids: adminIds })
      .andWhere('appeal.decisionResult != 5 AND appeal.status = :status', { status: AppealStatus.CLOSE })
      .select('appeal.adminId', 'adminSupporterId')
      .addSelect('COUNT(appeal.id)', 'count')
      .groupBy('appeal.adminId')
      .getRawMany();
  }

  public async getOpenAppealByAdminSupporter(adminSupporterId: string) {
    return await this.appealRepository.findOne({
      where: {
        status: Not(AppealStatus.CLOSE),
        adminId: adminSupporterId,
      },
    });
  }
  public async getAppealDetailBySecret(secret: string): Promise<Appeal | undefined> {
    const appeal = await this.appealRepository.findOne({
      where: { secret },
      relations: [
        'order',
        'order.asset',
        'order.merchant',
        'userWinner',
        'operationWinner',
        'order.merchant.merchantManager',
        'operationWinner.merchantManager',
      ],
    });
    return appeal;
  }
}
