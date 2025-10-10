import {OperationRepository} from '@api/profile/repositories/OperationRepository';
import {Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {NotificationType, OperationStatus, OperationType} from '@api/common/models';
import {wrap} from '@base/utils/redis-client';
import {AVATARS_CACHE_KEY} from '@api/profile/services/SharedProfileService';
import {In, IsNull, Not} from 'typeorm';
import {FindAllMerchants} from '@api/profile/types/Operation';
import {Operation} from '@api/profile/models/Operation';
import {EntityBase} from '@api/infrastructure/abstracts/EntityBase';
import {BaseProfileService} from '@api/profile/services/BaseProfileService';
import moment from 'moment';

@Service()
export class MerchantProfileService extends BaseProfileService {
  constructor(
    @InjectRepository() protected operationRepository: OperationRepository
  ) {
    super(operationRepository);
  }

  public async findOneById(id: string) {
    return await this.operationRepository.findOne(id, { relations: ['twoFactorAuth'] });
  }

  public async findStaffByManager(id: string, merchantManagerId: string) {
    return await this.operationRepository.findOne(id, { where: { id, merchantManagerId }, relations: ['statistic', 'twoFactorAuth'], withDeleted: true });
  }

  public async findOneByWallet(walletAddress: string) {
    return await this.operationRepository.findOne({ where: { walletAddress }, withDeleted: true });
  }

  public async updateAllowNotification(id: string, allowNotification: NotificationType[]) {
    await this.operationRepository.update(id, { allowNotification });
  }

  public async checkAvatarIsExist(avatar: string) {
    const avatarCount = await this.operationRepository.count({ avatar });
    return !!avatarCount;
  }

  public async updateAvatar(id: string, avatar: string) {
    await this.operationRepository.update(id, { avatar });
  }

  public async getOperationsUsingAvatar() {
    return await wrap(AVATARS_CACHE_KEY, () =>
      this.operationRepository.find({
        where: {
          type: OperationType.MERCHANT_MANAGER,
          avatar: Not(IsNull()),
        },
        select: ['avatar'],
      })
    );
  }

  public async findAllMerchants(options: FindAllMerchants) {
    return await this.operationRepository.findAllMerchants(options);
  }

  public async getStatisticByOperationIds(operationIds: string[]) {
    return await this.operationRepository.getStatisticByOperationIds(operationIds);
  }

  public async getStaffByNickName(managerId: string, nickName: string) {
    return await this.operationRepository.findOne({
      where: {
        nickName,
        type: In([OperationType.MERCHANT_SUPPORTER, OperationType.MERCHANT_OPERATOR]),
        merchantManagerId: managerId,
      },
    });
  }

  public async countStaff(managerId: string, status: OperationStatus[]) {
    return await this.operationRepository.count({
      where: {
        status: In(status),
        type: In([OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER]),
        merchantManagerId: managerId,
      },
    });
  }

  public async createStaff(payload: Partial<Omit<Operation, keyof EntityBase | 'walletAddress'>> & { walletAddress: string; }) {

    const operator = this.operationRepository.merge(this.operationRepository.create(), {
      ...payload,
      allowNotification: [NotificationType.ALL],
    });
    return await this.operationRepository.save(operator);
  }

  public async updateStaffRelationship(id: string, statisticId: string, peerChatId: string) {
    await this.operationRepository.update(id, { statisticId, peerChatId });
  }

  public async updateStaff(id: string, payload: Partial<Pick<Operation, 'nickName' | 'walletAddress' | 'status' | 'activatedAt' | 'updatedAt'>>) {
    await this.operationRepository.update(id, payload);
  }

  public async updateManagerStaffs(merchantManagerId: string, payload: Partial<Pick<Operation, 'contractFrom' | 'contractTo'>>) {
    await this.operationRepository.update(
      { merchantManagerId },
      {
        contractFrom: payload.contractFrom ?? null,
        contractTo: payload.contractTo ?? null,
      }
    );
  }

  public async softDelete(id: string) {
    return await this.operationRepository.update(id, {
      avatar: null,
      status: OperationStatus.DELETED,
      deletedAt: moment().utc().toDate(),
    });
  }

  public async getAllSupporterProcessing(managerId: string) {
    return await this.operationRepository.getAllSupporterProcessing(managerId);
  }
}
