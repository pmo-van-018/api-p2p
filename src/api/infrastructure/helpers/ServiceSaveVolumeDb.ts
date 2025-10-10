import { UserType } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { orderSumData } from '@api/statistic/types/Volume';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import moment from 'moment';
import { IsolationLevel, Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

export class ServiceSaveVolumeDbHelper {
  constructor(
    protected sharedOperationService: SharedProfileService,
    @Logger(__filename) public log: LoggerInterface,
    protected volumeService: VolumeService,
    protected statisticService: StatisticService
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  public async saveVolumeDb() {
    await this.volumeService.clearAllManagerStatisticCacheKeys();
    const days = Number(env.cronJob.updateVolumeDataByDay) || 1;
    const startDate = moment().utc().subtract(days, 'days').startOf('day').toDate();
    const endDate = moment().utc().subtract(1, 'days').endOf('day').toDate();
    const startOfToday = moment().utc().startOf('day').toDate();

    await this.storeStatistic(await this.sharedOperationService.getActiveUsers(), startDate, startOfToday, endDate);
    await this.storeStatistic(
      await this.sharedOperationService.getActiveOperations(),
      startDate,
      startOfToday,
      endDate
    );
  }

  protected formatOrderSumData(orderData: orderSumData) {
    Object.keys(orderData).forEach((key, _index) => {
      orderData[key] = orderData[key] ? Number(orderData[key]) : 0;
    });
    return orderData;
  }

  private async storeStatistic(paramsData: User[] | Operation[], startDate: any, startOfToday: any, endDate: any) {
    for (const user of paramsData) {
      if (
        user.statistic?.lastCountAt &&
        !moment(user.statistic?.lastCountAt).utc().startOf('day').diff(startOfToday) &&
        !env.testMode.statistic
      ) {
        continue;
      }
      const userType: number = user.type;
      const userId = user.id;
      try {
        const startTime = env.testMode.statistic ? user.statistic?.lastCountAt || startDate : startDate;
        const endTime = env.testMode.statistic ? moment().utc().toDate() : endDate;
        const orders = await this.volumeService.getOrdersByUserIdGroupByCompleteTime(userId, userType, {
          startDate: startTime,
          endDate: endTime,
        });
        for (const orderData of orders) {
          const formatSumData = this.formatOrderSumData(orderData);
          await this.updateStatisticForUserOrOperation(userType, userId, formatSumData);
        }
        await this.volumeService.calculateMerchantRating();
      } catch (error: any) {
        this.log.error(error.message);
      }
    }
  }

  private async updateStatisticForUserOrOperation(userType: number, userId: string, formatSumData: orderSumData) {
    let volumeCondition = {};
    if (userType === UserType.USER) {
      volumeCondition = {
        userId,
      };
      await this.statisticService.updateUserTotalStatistic(userId, formatSumData);
    } else {
      volumeCondition = {
        operationId: userId,
      };
      await this.statisticService.updateOperationTotalStatistic(userId, formatSumData);
    }

    await this.volumeService.updateOrCreateStatisticByUserIdAndDay(volumeCondition, formatSumData);
  }
}
