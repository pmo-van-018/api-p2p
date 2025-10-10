import { UserViewByUser } from '@api/profile/types/User';

export class UserProfileResponse {
  public id: string;
  public nickName: string;
  public createdAt: Date;
  public walletAddress: string;
  public lastLoginAt: Date;
  public lastBuyOrder: Date;
  public lastSellOrder: Date;

  constructor(user: UserViewByUser) {
    this.id = user.id;
    this.nickName = user.nickName;
    this.createdAt = user.createdAt;
    this.walletAddress = user.walletAddress;
    this.lastLoginAt = user.lastLoginAt;
    this.lastBuyOrder = user.lastBuyOrder;
    this.lastSellOrder = user.lastSellOrder;
  }
}
