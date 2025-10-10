import { Statistic } from '@api/statistic/models/Statistic';

export type StatisticDataTypes = Pick<
  Statistic,
  | 'totalOrderCount'
  | 'totalBuyOrderCount'
  | 'totalSellOrderCount'
  | 'totalAmountCount'
  | 'totalFeeCount'
  | 'totalPenaltyFeeCount'
  | 'orderCompletedCount'
  | 'orderWaitingCount'
  | 'orderWaitingUserCount'
  | 'orderAppealCount'
  | 'cancelOrderCount'
  | 'monthOrderCount'
  | 'monthOrderCompletedCount'
  | 'postShownCount'
  | 'postHideCount'
  | 'averageCancelledTime'
  | 'averageCompletedTime'
>;

export type Operator = '+' | '-';

export type OperatorAndCount = {
  operator: Operator;
  count: number;
};

export type StatisticOverviewResult = {
   // get from statistic
   totalOrder: number,
   totalBuyOrder: number,
   totalSellOrder: number,
   totalAmount: number,
   totalFee: number,
   totalPenaltyFee: number,

   // get by sum volume
   totalRecentOrder: number,
   totalRecentBuyOrder: number,
   totalRecentSellOrder: number,
   recentCompleteRate: number,
   totalRecentAmount: number,
   totalRecentFee: number,
   totalRecentPenaltyFee: number,
   totalSuccess?: number,
}

