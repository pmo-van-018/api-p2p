import { OperationRepository } from '@api/profile/repositories/OperationRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { NotificationType, OperationStatus, OperationType } from '@api/common/models';
import { FindAllMerchants } from '@api/profile/types/Operation';
import { Operation } from '@api/profile/models/Operation';
import { In } from 'typeorm';
import moment, { MomentInput } from 'moment';
import { FindAdminSupporterRequest } from '@api/profile/requests/FindAdminSupporterRequest';
import { BaseProfileService } from '@api/profile/services/BaseProfileService';
import { FindSuperAdminRequest } from '../requests/FindSuperAdminRequest';

@Service()
export class AdminProfileService extends BaseProfileService {
  constructor(
    @InjectRepository() protected operationRepository: OperationRepository
  ) {
    super(operationRepository);
  }

  public async findOneByNickName(nickName: string) {
    return await this.operationRepository.findOne({
      where: {
        nickName,
        type: In([OperationType.SUPER_ADMIN, OperationType.SYSTEM_ADMIN]),
      },
    });
  }

  public async findOneStaffByNickName(nickName: string, types: OperationType[]) {
    return await this.operationRepository.findOne({
      where: {
        nickName,
        type: In(types),
      },
    });
  }

  public async findOneById(id: string, type: OperationType) {
    return await this.operationRepository.findOne({
      where: {
        id,
        type,
      },
      relations: ['twoFactorAuth'],
    });
  }

  public async updateAllowNoti(id: string, allowNotification: NotificationType[]) {
    return await this.operationRepository.update({ id }, { allowNotification });
  }

  public async updateOperationsStatus(ids: string[], status: OperationStatus) {
    await this.operationRepository.update({ id: In(ids)}, { status });
  }

  public async findAllMerchants(options: FindAllMerchants) {
    return await this.operationRepository.findAllMerchants(options);
  }

  public setOperationStatistic(operations: Operation[], statistics: any[]) {
    return operations.map((op: Operation) => {
      const statistic = statistics.find((e) => e.merchantManagerId === op.id);
      if (statistic && op.statistic) {
        op.statistic.averageCompletedTime = Number(statistic.totalCompletedTime) / Number(statistic.totalCompletedCount);
        op.statistic.averageCancelledTime = Number(statistic.totalCancelledTime) / Number(statistic.totalCancelledCount);
      }
      return op;
    });
  }

  public async setManagerGasless(managerId: string, payload: Partial<Pick<Operation, 'allowGasless' | 'gaslessTransLimit'>>) {
    await this.operationRepository.update(managerId, {
      allowGasless: payload.allowGasless,
      gaslessTransLimit: payload.gaslessTransLimit,
    });
  }

  public async updateAdmin(adminId: string, payload: Partial<Pick<Operation, 'walletAddress' | 'nickName' | 'status' | 'activatedAt'>>) {
    await this.operationRepository.update(adminId, payload);
  }

  public getDateContract(
    payload: { contractFrom?: MomentInput; contractTo?: MomentInput },
    merchantManager?: Operation
  ): { contractFrom: Date; contractTo: Date } {
    const contractFrom = payload.contractFrom
      ? moment(payload.contractFrom).utc().toDate()
      : merchantManager?.contractFrom;
    const contractTo = payload.contractTo ? moment(payload.contractTo).utc().toDate() : merchantManager?.contractTo;
    return { contractFrom, contractTo };
  }

  public async createOperation(payload: Partial<Operation>) {
    const operator = this.operationRepository.merge(this.operationRepository.create(), {
      ...payload,
      allowNotification: [NotificationType.ALL],
    });
    return await this.operationRepository.save(operator);
  }

  public async softDeleteOperation(managerId: string) {
    return await this.operationRepository.update({ id: managerId }, {
      avatar: null,
      status: OperationStatus.DELETED,
      deletedAt: moment().utc().toDate(),
    });
  }

  public async softDeleteManagerStaff(managerId: string) {
    return await this.operationRepository.update({ merchantManagerId: managerId }, {
      avatar: null,
      status: OperationStatus.DELETED,
      deletedAt: moment().utc().toDate(),
    });
  }

  public async findAllAdminSupporters(query: FindAdminSupporterRequest) {
    return await this.operationRepository.searchAllAdmins(query, OperationType.ADMIN_SUPPORTER);
  }

  public async findAllSuperAdmins(query: FindSuperAdminRequest) {
    return await this.operationRepository.searchAllAdmins(query, OperationType.SUPER_ADMIN, true);
  }
}
