import { UserViewByAdmin } from '@api/profile/types/User';

export class UserInfoStatistic {
  public id: string;
  public nickName: string;
  public createdAt: Date;
  public walletAddress: string;
  public lastLoginAt: Date;
  public totalBuyOrderCount: number;
  public totalSellOrderCount: number;
  public lastBuyOrder: Date;
  public lastSellOrder: Date;
  constructor(user: UserViewByAdmin) {
    this.id = user.id;
    this.nickName = user.nickName;
    this.createdAt = user.createdAt;
    this.walletAddress = user.walletAddress;
    this.lastLoginAt = user.lastLoginAt;
    this.totalBuyOrderCount = user.totalBuyOrderCount;
    this.totalSellOrderCount = user.totalSellOrderCount;
    this.lastBuyOrder = user.lastBuyOrder;
    this.lastSellOrder = user.lastSellOrder;
  }
}
