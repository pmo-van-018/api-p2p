import { Operation } from '@api/profile/models/Operation';
import { OperationStatus } from '@api/common/models/P2PEnum';

export class SuperAdminInfoResponse {
  public id: string;
  public walletAddress: string;
  public nickName: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public activatedAt: Date;

  constructor(operation: Operation) {
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.nickName = operation.nickName;
    this.status = OperationStatus[operation.status];
    this.createdAt = operation.createdAt;
    this.updatedAt = operation.updatedAt;
    this.activatedAt = operation.activatedAt;
  }
}
