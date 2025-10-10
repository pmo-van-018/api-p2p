import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import BigNumber from 'bignumber.js';
import { OperationType, TradeType } from '@api/common/models';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { Operation } from '@api/profile/models/Operation';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { DashboardService } from '@api/statistic/services/DashboardService';

@Service()
export class GetMerchantOverviewStatisticUseCase {
  constructor(
    private dashboardService: DashboardService,
    private sharedPostService: SharedPostService,
    private sharedOperationService: SharedProfileService,
    private sharedAppealService: SharedAppealService,
    private sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOverviewStatistic(currentUser: Operation) {
    this.log.debug(`Start implement getOverviewStatistic: ${currentUser.id}`);
    let result = {
      totalPost: 0,
      totalBuyPost: 0,
      totalSellPost: 0,
      totalOrder: 0,
      totalBuyOrder: 0,
      totalSellOrder: 0,
      totalAmount: 0,
      totalFee: 0,
      totalPenaltyFee: 0,
      // recent data
      totalRecentOrder: 0,
      totalRecentBuyOrder: 0,
      totalRecentSellOrder: 0,
      recentCompleteRate: 0,
      totalRecentAmount: 0,
      totalRecentFee: 0,
      totalRecentPenaltyFee: 0,
      // manage statistic
      totalSellOrderProcessing: 0,
      totalBuyOrderProcessing: 0,
      totalAppealedOrder: 0,
      totalActiveOperator: 0,
      totalInactiveOperator: 0,
      user: currentUser,
    };

    // Count recent volume
    const overview = await this.dashboardService.getStatisticOverview(currentUser);
    result = {...result, ...overview };

    const countMerchantPosts = await this.sharedPostService.countMerchantManagerPosts(currentUser.id, currentUser.type);
    result.totalPost = new BigNumber(countMerchantPosts.totalBuy).plus(countMerchantPosts.totalSell).toNumber();
    result.totalBuyPost = Number(countMerchantPosts.totalBuy);
    result.totalSellPost = Number(countMerchantPosts.totalSell);

    if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      // get total operator
      const countOperators = await this.sharedOperationService.statisticStaffByManager(currentUser.id);
      result.totalActiveOperator = Number(countOperators.totalActive);
      result.totalInactiveOperator = Number(countOperators.totalInactive);

      // Get total order complained
      result.totalAppealedOrder = await this.sharedAppealService.countAppealByManagerId(currentUser.id);

      const totalOrders = await this.sharedOrderService.countTotalOrderProcessingByRole(currentUser);
      const totalSellOrderProcessing = Number(totalOrders?.find((e) => e.type === TradeType.SELL)?.total_order || 0);
      const totalBuyOrderProcessing = Number(totalOrders?.find((e) => e.type === TradeType.BUY)?.total_order || 0);
      result.totalBuyOrderProcessing = totalSellOrderProcessing;
      result.totalSellOrderProcessing = totalBuyOrderProcessing;
    }

    this.log.debug(`Stop implement getStatisticByUer: ${currentUser.id}`);

    return result;
  }
}
