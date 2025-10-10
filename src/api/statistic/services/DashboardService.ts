/* tslint:disable:max-line-length */
import { Service } from 'typedi';

import { OperationType, UserType } from '@api/common/models/P2PEnum';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import BigNumber from 'bignumber.js';
import { MONTHLY_DAYS_NUMBER } from '@api/order/constants/order';
import { orderSumData } from '../types/Volume';
import { StatisticOverviewResult } from '../types/Statistic';
import { getCache } from '@base/utils/redis-client';
import { env } from '@base/env';
import { formatObjectKeysToNumber } from '@base/utils/helper.utils';

@Service()
export class DashboardService {
  constructor(
    private volumeService: VolumeService,
    private statisticService: StatisticService,
    @Logger(__filename) private log: LoggerInterface
  ) { }

  public async getStatisticOverview(currentUser: Operation | User) {
    this.log.debug(`Start implement getStatisticOverview: ${currentUser.id}`);
    const result: StatisticOverviewResult = {
      // get from statistic
      totalOrder: 0,
      totalBuyOrder: 0,
      totalSellOrder: 0,
      totalAmount: 0,
      totalFee: 0,
      totalPenaltyFee: 0,

      // get by sum volume
      totalRecentOrder: 0,
      totalRecentBuyOrder: 0,
      totalRecentSellOrder: 0,
      recentCompleteRate: 0,
      totalRecentAmount: 0,
      totalRecentFee: 0,
      totalRecentPenaltyFee: 0,
      totalSuccess: 0,
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
    result.totalRecentBuyOrder = this.isMerchantOrOperator(currentUser.type)
      ? totalRecentSellOrder
      : totalRecentBuyOrder;
    result.totalRecentSellOrder = this.isMerchantOrOperator(currentUser.type)
      ? totalRecentBuyOrder
      : totalRecentSellOrder;
    result.totalRecentOrder = new BigNumber(result.totalRecentBuyOrder || 0)
      .plus(result.totalRecentSellOrder || 0)
      .toNumber();
    result.totalSuccess = recentVolumes.reduce((total, e) => new BigNumber(e?.totalSuccess || 0).plus(total).toNumber(), 0);
    result.recentCompleteRate = Helper.computePercentCalculation(
      result.totalSuccess,
      result.totalRecentOrder
    );
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

    if (currentUser.type === UserType.USER || currentUser.type === OperationType.MERCHANT_OPERATOR) {
      const statistic =
        currentUser.type === UserType.USER
          ? await this.statisticService.getOrCreateStatisticByUserId(currentUser.id)
          : await this.statisticService.getOrCreateStatisticByOperationId(currentUser.id);
      result.totalAmount = statistic.totalAmountCount;
      result.totalFee = statistic.totalFeeCount;
      result.totalPenaltyFee = statistic.totalPenaltyFeeCount;
      result.totalOrder = statistic.totalOrderCount;
      result.totalBuyOrder = this.isMerchantOrOperator(currentUser.type)
        ? statistic.totalSellOrderCount
        : statistic.totalBuyOrderCount;
      result.totalSellOrder = this.isMerchantOrOperator(currentUser.type)
        ? statistic.totalBuyOrderCount
        : statistic.totalSellOrderCount;
    }

    if (currentUser.type === OperationType.MERCHANT_MANAGER || currentUser.type === OperationType.SUPER_ADMIN) {
      const statistic = await this.statisticService.countAllOperator(
        currentUser.type === OperationType.MERCHANT_MANAGER ? currentUser.id : null
      );
      result.totalAmount = Number(statistic.totalAmountCount);
      result.totalFee = Number(statistic.totalFeeCount);
      result.totalPenaltyFee = Number(statistic.totalPenaltyFeeCount);
      result.totalOrder = Number(statistic.totalOrderCount);
      result.totalBuyOrder = this.isMerchantOrOperator(currentUser.type)
        ? Number(statistic.totalSellOrderCount)
        : Number(statistic.totalBuyOrderCount);
      result.totalSellOrder = this.isMerchantOrOperator(currentUser.type)
        ? Number(statistic.totalBuyOrderCount)
        : Number(statistic.totalSellOrderCount);
    }

    if (statisticCache) {
      this.countWithStatisticCache(formatObjectKeysToNumber(statisticCache), result, this.isMerchantOrOperator(currentUser.type));
    }

    this.log.debug(`Stop implement getDataDashboardById: ${currentUser.id}`);

    return result;
  }

  public countWithStatisticCache(statisticCache: orderSumData, statisticOverviewResult: StatisticOverviewResult, isMerchant = false) {
    statisticOverviewResult.totalAmount = new BigNumber(statisticOverviewResult.totalAmount).plus(statisticCache.totalAmount).toNumber();
    statisticOverviewResult.totalFee = new BigNumber(statisticOverviewResult.totalFee).plus(statisticCache.totalFee).toNumber();
    statisticOverviewResult.totalPenaltyFee = new BigNumber(statisticOverviewResult.totalPenaltyFee).plus(statisticCache.totalPenaltyFee).toNumber();
    statisticOverviewResult.totalRecentAmount = new BigNumber(statisticOverviewResult.totalRecentAmount).plus(statisticCache.totalAmount).toNumber();
    statisticOverviewResult.totalRecentFee = new BigNumber(statisticOverviewResult.totalRecentFee).plus(statisticCache.totalFee).toNumber();
    statisticOverviewResult.totalRecentPenaltyFee = new BigNumber(statisticOverviewResult.totalRecentPenaltyFee).plus(statisticCache.totalPenaltyFee).toNumber();
    statisticOverviewResult.totalOrder += Number(statisticCache.totalBuyOrder) + Number(statisticCache.totalSellOrder);
    statisticOverviewResult.totalBuyOrder += isMerchant ? Number(statisticCache.totalSellOrder) : Number(statisticCache.totalBuyOrder);
    statisticOverviewResult.totalSellOrder += isMerchant ? Number(statisticCache.totalBuyOrder) : Number(statisticCache.totalSellOrder);
    statisticOverviewResult.totalRecentBuyOrder += isMerchant ? Number(statisticCache.totalSellOrder) : Number(statisticCache.totalBuyOrder);
    statisticOverviewResult.totalRecentSellOrder += isMerchant ? Number(statisticCache.totalBuyOrder) : Number(statisticCache.totalSellOrder);
    statisticOverviewResult.totalSuccess += Number(statisticCache.totalSuccessOrder);
    statisticOverviewResult.totalRecentOrder += Number(statisticCache.totalBuyOrder) + Number(statisticCache.totalSellOrder);
    statisticOverviewResult.recentCompleteRate = Helper.computePercentCalculation(statisticOverviewResult.totalSuccess, statisticOverviewResult.totalRecentOrder);
  }

  private isMerchantOrOperator(type: number) {
    const reverseOrderTypes = [OperationType.MERCHANT_MANAGER, OperationType.MERCHANT_OPERATOR];
    return reverseOrderTypes.includes(type);
  }
}
