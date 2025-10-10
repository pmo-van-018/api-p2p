import { UserPublicViewResponse } from '@api/profile/responses/UserPublicInfoResponse';
import { DashboardDataType } from '@api/statistic/types/Dashboard';
import BigNumber from 'bignumber.js';

export class DashboardResponse {
  public totalOrder: number;
  public totalBuyOrder: number;
  public totalSellOrder: number;
  public totalAmount: number;
  public totalFee: number;
  public totalPenaltyFee: number;
  // get by sum volume
  public totalRecentOrder: number;
  public totalRecentBuyOrder: number;
  public totalRecentSellOrder: number;
  public recentCompleteRate: number;
  public totalRecentAmount: number;
  public totalRecentFee: number;
  public totalRecentPenaltyFee: number;
  // manage statistic
  public totalPost: number;
  public totalBuyPost: number;
  public totalSellPost: number;
  public totalActiveOperator: number;
  public totalInactiveOperator: number;
  public totalActiveManager: number;
  public totalInactiveManager: number;
  public totalActiveUser: number;
  public totalInactiveUser: number;
  public totalSellOrderProcessing: number;
  public totalBuyOrderProcessing: number;
  public totalAppealedOrder: number;

  public userPublicInfo: UserPublicViewResponse;

  constructor(dashboardData: DashboardDataType) {
    this.totalOrder = dashboardData.totalOrder;
    this.totalBuyOrder = dashboardData.totalBuyOrder;
    this.totalSellOrder = dashboardData.totalSellOrder;
    this.totalAmount = Number(dashboardData?.totalAmount || 0);
    this.totalFee = Number(dashboardData?.totalFee || 0);
    this.totalPenaltyFee = Number(dashboardData?.totalPenaltyFee || 0);
    // get by sum volume
    this.totalRecentOrder = dashboardData.totalRecentOrder;
    this.totalRecentBuyOrder = dashboardData.totalRecentBuyOrder;
    this.totalRecentSellOrder = dashboardData.totalRecentSellOrder;
    this.recentCompleteRate = new BigNumber(dashboardData.recentCompleteRate).multipliedBy(100).toNumber();
    this.totalRecentAmount = dashboardData.totalRecentAmount;
    this.totalRecentFee = dashboardData.totalRecentFee;
    this.totalRecentPenaltyFee = dashboardData.totalRecentPenaltyFee;
    // manage statistic
    this.totalPost = dashboardData.totalPost;
    this.totalBuyPost = dashboardData.totalBuyPost;
    this.totalSellPost = dashboardData.totalSellPost;
    this.totalActiveOperator = dashboardData.totalActiveOperator;
    this.totalInactiveOperator = dashboardData.totalInactiveOperator;
    this.totalActiveManager = dashboardData.totalActiveManager;
    this.totalInactiveManager = dashboardData.totalInactiveManager;
    this.totalActiveUser = dashboardData.totalActiveUser;
    this.totalInactiveUser = dashboardData.totalInactiveUser;
    // user public view
    this.userPublicInfo = dashboardData.user ? new UserPublicViewResponse(dashboardData.user) : undefined;

    this.totalSellOrderProcessing = dashboardData.totalSellOrderProcessing;
    this.totalBuyOrderProcessing = dashboardData.totalBuyOrderProcessing;

    this.totalAppealedOrder = dashboardData.totalAppealedOrder;
  }
}
