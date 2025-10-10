export type orderSumData = {
  createTime: Date;
  totalAmount: number;
  totalFee?: number;
  totalPenaltyFee?: number;
  totalBuyOrder: number;
  totalSellOrder: number;
  totalSuccessOrder: number;
  totalOrderCancelled?: number;
  totalOrderAppeal?: number;
  totalLifecycleCompletedTime?: number;
  totalLifecycleCancelledTime?: number;
  averageCompletedTime?: number;
  averageCancelledTime?: number;
};
