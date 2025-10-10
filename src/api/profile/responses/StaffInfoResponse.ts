import { Operation } from '@api/profile/models/Operation';
import { StatisticResponse } from '@api/statistic/responses/StatisticResponse';
import { OperationInfoResponse } from './OperationInfoResponse';

export class StaffInfoResponse extends OperationInfoResponse {
  public merchantManagerId: string;
  public contractFrom: Date;
  public contractTo: Date;
  public deletedAt: Date;
  public statistic: StatisticResponse;
  public merchantManagerNickName: string;
  public activatedAt: Date;

  constructor(operation: Operation) {
    super(operation);
    this.merchantManagerId = operation.merchantManagerId;
    this.contractFrom = operation.contractFrom;
    this.contractTo = operation.contractTo;
    this.statistic = new StatisticResponse(operation.statistic);
    this.merchantManagerNickName = operation.merchantManager?.nickName || '';
    this.activatedAt = operation.activatedAt;
    this.deletedAt = operation.deletedAt;
  }
}
