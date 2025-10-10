import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { MerchantPublicInfo } from '@api/profile/types/Operation';
import { StatisticBaseResponse } from '@api/statistic/responses/StatisticBaseResponse';

export class StaffInfoBaseResponse {
  public id: string;
  public walletAddress: string;
  public type: string;
  public nickName: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  public statistic: StatisticBaseResponse;
  public merchantManagerNickName: string;
  public activatedAt: Date;

  constructor(operation: MerchantPublicInfo) {
    this.merchantManagerNickName = operation.merchantManager?.nickName || '';
    this.activatedAt = operation.activatedAt;
    this.deletedAt = operation.deletedAt;
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.type = OperationType[operation.type];
    this.nickName = operation.nickName;
    this.status = OperationStatus[operation.status];
    this.createdAt = operation.createdAt;
    this.updatedAt = operation.updatedAt;

    this.statistic = new StatisticBaseResponse(operation?.statistic);
  }
}
