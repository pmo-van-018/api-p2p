import { Operation } from '@api/profile/models/Operation';
import { OperationStatus } from '@api/common/models/P2PEnum';

export class ManagerListInfoResponse {
  public id: string;
  public walletAddress: string;
  public nickName: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public contractFrom: Date;
  public activatedAt: Date;
  public registeredMembers?: number;
  public averageCompletedTime?: number;
  public averageCancelledTime?: number;
  public allowGasless?: boolean;
  public gaslessTransLimit?: number;

  constructor(operation: Operation) {
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.nickName = operation.nickName;
    this.status = OperationStatus[operation.status];
    this.createdAt = operation.createdAt;
    this.updatedAt = operation.updatedAt;
    this.contractFrom = operation.contractFrom;
    this.activatedAt = operation.activatedAt;
    this.allowGasless = operation.allowGasless;
    this.gaslessTransLimit = operation.gaslessTransLimit;
    this.registeredMembers =
      operation.merchantOperators?.filter(
        (merchantOperator) =>
          merchantOperator.status !== OperationStatus.BLOCKED &&
          merchantOperator.status !== OperationStatus.DELETED &&
          !merchantOperator.deletedAt
      ).length ?? 0;
    this.averageCompletedTime = operation.statistic?.averageCompletedTime || 0;
    this.averageCancelledTime = operation.statistic?.averageCancelledTime || 0;
  }
}

export class ManagerListInfoInReporterResponse {
  public id: string;
  public walletAddress: string;
  public nickName: string;
  public status: string;

  constructor(operation: Operation) {
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.nickName = operation.nickName;
    this.status = OperationStatus[operation.status];
  }
}
