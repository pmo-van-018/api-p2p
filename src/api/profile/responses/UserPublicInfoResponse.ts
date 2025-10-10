import { User } from '@api/profile/models/User';
import { UserStatus, UserType } from '@api/common/models/P2PEnum';
import { Order } from '@api/order/models/Order';
import { Operation } from '@api/profile/models/Operation';

export class UserPublicViewResponse {
  public id: string;
  public type: string;
  public nickName: string;
  public avatar: string;
  public orders: Order[];
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public walletAddress: string;
  public lastLoginAt: Date;

  constructor(user: User | Operation) {
    this.id = user.id;
    this.type = UserType[user.type];
    this.nickName = user.nickName;
    this.orders = user.orders;
    this.status = UserStatus[user.status];
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.walletAddress = user.walletAddress;
    this.lastLoginAt = user.lastLoginAt;
    this.avatar = (user as Operation).avatar;
  }
}
