import { DashboardDataType } from '@api/statistic/types/Dashboard';
import BigNumber from 'bignumber.js';

export class UserStatisticResponse {
  public totalOrder: number;
  public totalBuyOrder: number;
  public totalSellOrder: number;
  public totalAmount: number;

  public totalRecentOrder: number;
  public totalRecentBuyOrder: number;
  public totalRecentSellOrder: number;
  public recentCompleteRate: number;
  public totalRecentAmount: number;

  public createdAt: Date;

  constructor(dashboardData: DashboardDataType) {
    this.totalOrder = dashboardData.totalOrder;
    this.totalBuyOrder = dashboardData.totalBuyOrder;
    this.totalSellOrder = dashboardData.totalSellOrder;
    this.totalAmount = Number(dashboardData?.totalAmount || 0);
    // get by sum volume
    this.totalRecentOrder = dashboardData.totalRecentOrder;
    this.totalRecentBuyOrder = dashboardData.totalRecentBuyOrder;
    this.totalRecentSellOrder = dashboardData.totalRecentSellOrder;
    this.recentCompleteRate = new BigNumber(dashboardData.recentCompleteRate).multipliedBy(100).toNumber();
    this.totalRecentAmount = dashboardData.totalRecentAmount;
    this.createdAt = dashboardData.createdAt;
  }
}
