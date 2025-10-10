import { Service } from 'typedi';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import BigNumber from 'bignumber.js';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { VolumeService } from '@api/statistic/services/VolumeService';
import {OperationType, TradeType, UserType} from '@api/common/models';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { Operation } from '@api/profile/models/Operation';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { MONTHLY_DAYS_NUMBER } from '@api/order/constants/order';
import { getCache } from '@base/utils/redis-client';
import { orderSumData } from '../types/Volume';
import { env } from '@base/env';
import { DashboardService } from '../services/DashboardService';
import { formatObjectKeysToNumber } from '@base/utils/helper.utils';

@Service()
export class GetAdminOverviewStatisticUseCase {
  constructor(
    private volumeService: VolumeService,
    private dashboardService: DashboardService,
    private statisticService: StatisticService,
    private sharedPostService: SharedPostService,
    private sharedOperationService: SharedProfileService,
    private sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOverviewStatistic(currentUser: Operation) {
    this.log.debug(`Start implement getOverviewStatistic: ${currentUser.id}`);
    const result = {
      // get from statistic
      totalOrder: 0,
      totalBuyOrder: 0,
      totalSellOrder: 0,
      totalAmount: 0,
      totalFee: 0,
      totalPenaltyFee: 0,
      totalSuccess: 0,

      // get by sum volume
      totalRecentOrder: 0,
      totalRecentBuyOrder: 0,
      totalRecentSellOrder: 0,
      recentCompleteRate: 0,
      totalRecentAmount: 0,
      totalRecentFee: 0,
      totalRecentPenaltyFee: 0,
      // manage statistic
      totalPost: 0,
      totalBuyPost: 0,
      totalSellPost: 0,
      totalActiveOperator: 0,
      totalInactiveOperator: 0,
      totalActiveManager: 0,
      totalInactiveManager: 0,
      totalActiveUser: 0,
      totalInactiveUser: 0,
      // Get from order
      totalSellOrderProcessing: 0,
      totalBuyOrderProcessing: 0,
      user: currentUser,
    };
    let numberMonthlyDays = MONTHLY_DAYS_NUMBER;
    const statisticCache: orderSumData = await getCache(this.volumeService.getStatisticCacheKey(currentUser.id));
    if (statisticCache) {
      numberMonthlyDays -= Number(env.cronJob.updateVolumeDataByDay);
    }
    // Count recent volume
    const recentVolumes = await this.volumeService.getRecentVolume(currentUser.id, currentUser.type, numberMonthlyDays);
    const totalRecentBuyOrder = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalBuy || 0).plus(total).toNumber(),
      0
    );
    const totalRecentSellOrder = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalSell || 0).plus(total).toNumber(),
      0
    );

    // order type is buy for EU then sell for MC
    result.totalRecentBuyOrder = totalRecentBuyOrder;
    result.totalRecentSellOrder = totalRecentSellOrder;
    result.totalRecentOrder = new BigNumber(result.totalRecentBuyOrder || 0)
      .plus(result.totalRecentSellOrder || 0)
      .toNumber();
    result.totalSuccess = recentVolumes.reduce((total, e) => new BigNumber(e?.totalSuccess || 0).plus(total).toNumber(), 0);
    result.recentCompleteRate = Helper.computePercentCalculation(result.totalSuccess, result.totalRecentOrder);
    result.totalRecentAmount = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalAmount || 0).plus(total).toNumber(),
      0
    );
    result.totalRecentFee = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalFee || 0).plus(total).toNumber(),
      0
    );
    result.totalRecentPenaltyFee = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalPenaltyFee || 0).plus(total).toNumber(),
      0
    );

    const statistic = await this.statisticService.countAllOperator(
      currentUser.type === OperationType.MERCHANT_MANAGER ? currentUser.id : null
    );
    result.totalAmount = Number(statistic.totalAmountCount);
    result.totalFee = Number(statistic.totalFeeCount);
    result.totalPenaltyFee = Number(statistic.totalPenaltyFeeCount);
    result.totalOrder = Number(statistic.totalOrderCount);
    result.totalBuyOrder = Number(statistic.totalBuyOrderCount);
    result.totalSellOrder = Number(statistic.totalSellOrderCount);

    const totalOrders = await this.sharedOrderService.countTotalOrderProcessingByRole(currentUser);
    result.totalBuyOrderProcessing = Number(totalOrders?.find((e) => e.type === TradeType.BUY)?.total_order || 0);
    result.totalSellOrderProcessing = Number(totalOrders?.find((e) => e.type === TradeType.SELL)?.total_order || 0);

    const countMerchantPosts = await this.sharedPostService.countMerchantManagerPosts(currentUser.id, currentUser.type);
    result.totalPost = new BigNumber(countMerchantPosts.totalBuy).plus(countMerchantPosts.totalSell).toNumber();
    result.totalBuyPost = Number(countMerchantPosts.totalBuy);
    result.totalSellPost = Number(countMerchantPosts.totalSell);

    const countOperators = await this.sharedOperationService.statisticOperationsByStatus([
      OperationType.MERCHANT_OPERATOR,
      OperationType.MERCHANT_SUPPORTER,
    ]);
    result.totalActiveOperator = Number(countOperators.totalActive);
    result.totalInactiveOperator = Number(countOperators.totalInactive);
    // get total manager
    const countManagers = await this.sharedOperationService.statisticManagerByStatus([OperationType.MERCHANT_MANAGER]);
    result.totalActiveManager = Number(countManagers.totalActive);
    result.totalInactiveManager = Number(countManagers.totalInactive);
    // get total user
    const countUsers = await this.sharedOperationService.statisticUsersByStatus([UserType.USER]);
    result.totalActiveUser = Number(countUsers.totalActive);
    result.totalInactiveUser = Number(countUsers.totalInactive);

    this.log.debug(`Stop implement getStatisticByUer: ${currentUser.id}`);

    if (statisticCache) {
      this.dashboardService.countWithStatisticCache(formatObjectKeysToNumber(statisticCache), result);
    }
    return result;
  }
}
