import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';

export type DashboardDataType = {
  totalOrder: number;
  totalBuyOrder: number;
  totalSellOrder: number;
  totalAmount: number;
  totalFee: number;
  totalPenaltyFee: number;
  // get by sum volume
  totalRecentOrder: number;
  totalRecentBuyOrder: number;
  totalRecentSellOrder: number;
  recentCompleteRate: number;
  totalRecentAmount: number;
  totalRecentFee: number;
  totalRecentPenaltyFee: number;
  // manage statistic
  totalPost: number;
  totalBuyPost: number;
  totalSellPost: number;
  totalActiveOperator: number;
  totalInactiveOperator: number;
  totalActiveManager: number;
  totalInactiveManager: number;
  totalActiveUser: number;
  totalInactiveUser: number;
  totalSellOrderProcessing: number;
  totalBuyOrderProcessing: number;
  totalAppealedOrder: number;
  user: User | Operation;
  createdAt?: Date;
};
