import { User } from '@api/profile/models/User';
import { OperationStatus, OperationType, UserStatus, UserType } from '@api/common/models/P2PEnum';
import { Order } from '@api/order/models/Order';
import { Operation } from '@api/profile/models/Operation';

export class WinnerInfoResponse {
  public id: string;
  public walletAddress: string;
  public nickName: string;
  public type: string;
  public orders: Order[];
  public status: string;

  constructor(winner: User | Operation) {
    this.id = winner.id;
    this.walletAddress = winner.walletAddress;
    this.nickName = winner.nickName;
    this.type = UserType[winner.type] ?? OperationType[winner.type];
    this.orders = winner.orders;
    this.status = UserStatus[winner.status] ?? OperationStatus[winner.status];
  }
}
