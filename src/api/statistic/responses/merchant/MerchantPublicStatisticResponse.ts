import { DashboardDataType } from '@api/statistic/types/Dashboard';
import BigNumber from 'bignumber.js';
import { UserStatus } from '@api/common/models';

export class MerchantPublicStatisticResponse {
  public totalOrder: number;
  public totalBuyOrder: number;
  public totalSellOrder: number;

  public totalRecentOrder: number;
  public totalRecentBuyOrder: number;
  public totalRecentSellOrder: number;
  public recentCompleteRate: number;

  public nickName: string;
  public avatar: string;
  public createdAt: Date;
  public status: string;

  constructor(dashboardData: DashboardDataType) {
    this.totalOrder = dashboardData.totalOrder;
    this.totalBuyOrder = dashboardData.totalBuyOrder;
    this.totalSellOrder = dashboardData.totalSellOrder;
    // get by sum volume
    this.totalRecentOrder = dashboardData.totalRecentOrder;
    this.totalRecentBuyOrder = dashboardData.totalRecentBuyOrder;
    this.totalRecentSellOrder = dashboardData.totalRecentSellOrder;
    this.recentCompleteRate = new BigNumber(dashboardData.recentCompleteRate).multipliedBy(100).toNumber();
    // manage statistic
    this.nickName = dashboardData.user?.nickName;
    this.avatar = dashboardData.user?.avatar;
    this.createdAt = dashboardData.user.createdAt;
    this.status = UserStatus[dashboardData.user.status];
  }
}
