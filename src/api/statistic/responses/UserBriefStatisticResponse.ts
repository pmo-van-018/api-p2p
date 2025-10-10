import { DashboardDataType } from '@api/statistic/types/Dashboard';
import BigNumber from 'bignumber.js';

export class UserBriefStatisticResponse {
  public totalOrder: number;
  public recentCompleteRate: number;

  constructor(dashboardData: DashboardDataType) {
    this.totalOrder = dashboardData.totalOrder;
    this.recentCompleteRate = new BigNumber(dashboardData.recentCompleteRate).multipliedBy(100).toNumber();
  }
}
