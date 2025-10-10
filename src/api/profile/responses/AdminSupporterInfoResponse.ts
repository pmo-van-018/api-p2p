import { Operation } from '@api/profile/models/Operation';
import { OperationStatus } from '@api/common/models/P2PEnum';

export class AdminSupporterInfoResponse {
  public id: string;
  public walletAddress: string;
  public nickName: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public activatedAt: Date;
  public pickAppealCount: number;
  public pickSupportRequestCount: number;

  constructor(data: { operation: Operation, appealCount: number, supportRequestCount: number }) {
    const { operation, appealCount, supportRequestCount } = data;
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.nickName = operation.nickName;
    this.status = OperationStatus[operation.status];
    this.createdAt = operation.createdAt;
    this.updatedAt = operation.updatedAt;
    this.activatedAt = operation.activatedAt;
    this.pickAppealCount = appealCount;
    this.pickSupportRequestCount = supportRequestCount;
  }
}
