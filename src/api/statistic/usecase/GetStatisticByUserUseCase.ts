import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { User } from '@api/profile/models/User';
import { DashboardService } from '@api/statistic/services/DashboardService';

@Service()
export class GetStatisticByUserUseCase {
  constructor(
    private dashboardService: DashboardService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getStatistic(currentUser: User) {
    this.log.debug(`Start implement getStatisticByUer: ${currentUser.id}`);
    const result = {
      // total data
      totalOrder: 0,
      totalBuyOrder: 0,
      totalSellOrder: 0,
      totalAmount: 0,
      // recent data
      totalRecentOrder: 0,
      totalRecentBuyOrder: 0,
      totalRecentSellOrder: 0,
      recentCompleteRate: 0,
      totalRecentAmount: 0,
      createdAt: currentUser.createdAt,
    };

    // Count recent volume
    const overview = await this.dashboardService.getStatisticOverview(currentUser);
    result.totalOrder = overview.totalOrder;
    result.totalBuyOrder = overview.totalBuyOrder;
    result.totalSellOrder = overview.totalSellOrder;
    result.totalAmount = overview.totalAmount;
    result.totalRecentOrder = overview.totalRecentOrder;
    result.totalRecentBuyOrder = overview.totalRecentBuyOrder;
    result.totalRecentSellOrder = overview.totalRecentSellOrder;
    result.recentCompleteRate = overview.recentCompleteRate;
    result.totalRecentAmount = overview.totalRecentAmount;

    this.log.debug(`Stop implement getStatisticByUer: ${currentUser.id}`);

    return result;
  }
}
