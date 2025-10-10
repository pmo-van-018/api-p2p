import { MAX_CHART_COLUMN } from '@api/common/date';
import { OperationType, UserType } from '@api/common/models/P2PEnum';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { CalculateMerchantRating } from '@api/order/types/Order';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { OperationRepository } from '@api/profile/repositories/OperationRepository';
import { Volume } from '@api/statistic/models/Volume';
import { VolumeRepository } from '@api/statistic/repositories/VolumeRepository';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { orderSumData } from '@api/statistic/types/Volume';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { deleteCacheWildcard, wrap } from '@base/utils/redis-client';
import _ from 'lodash';
import moment from 'moment';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

export const CACHE_REDIS_LATEST_MERCHANT_RATING_KEY = '__cache_latest_merchant_rating__';
export const STATISTIC_CACHE_KEY = '__statistic_cache__';

@Service()
export class VolumeService {
  constructor(
    @InjectRepository() private volumeRepository: VolumeRepository,
    @InjectRepository() private orderRepository: OrderRepository,
    @InjectRepository() private operationRepository: OperationRepository,
    @Logger(__filename) private log: LoggerInterface
  ) { }

  public async getRecentVolume(userId: string, userType: UserType | OperationType, numberMonthlyDays?: number) {
    return await this.volumeRepository.getRecentVolumes(userId, userType, numberMonthlyDays);
  }

  public async getVolumes(chartParamsRequest: ChartParamsRequest): Promise<{}> {
    try {
      const type = chartParamsRequest.type;
      const loginUser = await this.operationRepository.findOneOrFail({ id: chartParamsRequest.userId });
      const data = await this.volumeRepository.getAll(chartParamsRequest, loginUser.id, loginUser.type);
      return this.handleVolumeData({ data, type });
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getVolumesByOperation(chartParamsRequest: ChartParamsRequest, operationId: string, role: number) {
    return await this.volumeRepository.getAll(chartParamsRequest, operationId, role);
  }

  public getById(id: string): Promise<Volume | null> {
    try {
      return this.volumeRepository.findOneOrFail({ id });
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getOrdersByUserIdGroupByCompleteTime(
    userId: string,
    userType: UserType | OperationType,
    dateRange: { startDate; endDate }
  ) {
    try {
      this.log.debug(`Start implement getOrdersByUserIdGroupByCompleteTime for user ${userId} with type ${userType}`);
      const orders = await this.orderRepository.ordersByUserIdGroupByCompleteTime(userId, userType, dateRange);
      this.log.debug(`Stop implement getOrdersByUserIdGroupByCompleteTime for user ${userId} with type ${userType}`);
      return orders;
    } catch (error: any) {
      throw new Error(`[${this.getOrdersByUserIdGroupByCompleteTime.name}] failed: ${error.message ?? error}`);
    }
  }

  public async updateOrCreateStatisticByUserIdAndDay(userParams: {}, orderData: orderSumData): Promise<Volume | null> {
    const createTime = orderData.createTime;
    const dateTrans = moment(createTime).utc().startOf('day').toDate();
    const volume = await this.volumeRepository.findOne({
      where: {
        ...userParams,
        dateTrans,
      },
    });
    const payload = {
      numberTransactionSell: Number(orderData.totalSellOrder),
      numberTransactionBuy: Number(orderData.totalBuyOrder),
      numberTransactionSuccess: Number(orderData.totalSuccessOrder),
      amountTransaction: Number(orderData.totalAmount),
      totalFee: Number(orderData.totalFee || 0),
      totalPenaltyFee: Number(orderData.totalPenaltyFee || 0),
      numberTransactionCancelled: Number(orderData.totalOrderCancelled || 0),
      numberTransactionAppeal: Number(orderData.totalOrderAppeal || 0),
    };
    if (!volume) {
      return await this.volumeRepository.save({ ...payload, ...userParams, dateTrans });
    }
    if (env.testMode.statistic) {
      // Accumulate data in 1 day
      return await this.volumeRepository.accumulateRaw(volume.id, payload);
    }
    return await this.volumeRepository.save({ ...volume, ...payload });
  }

  public async getDataExportChart(chartParamsRequest: ChartParamsRequest): Promise<{}> {
    const contents = [];
    const headers = ['Thời Gian', 'Khối Lượng Giao Dịch (VND)', 'Phí Giao Dịch (VND)', 'Phí Phạt (VND)'];
    const type = chartParamsRequest.type;
    const loginUser = await this.operationRepository.findOneOrFail({ id: chartParamsRequest.userId });

    const data = await this.volumeRepository.getAll(chartParamsRequest, loginUser.id, loginUser.type);
    const isEmpty = data.every((e) => Number(e.amountTransaction) === 0 && Number(e.totalFee) === 0 && Number(e.totalPenaltyFee) === 0);
    if (isEmpty) {
      return null;
    }
    const volumes = data && data.length ? this.handleVolumeData({ data, type }) : [];
    if (volumes?.length) {
      volumes.forEach((e) => {
        const contentArr = [e.time, e.amount_transaction, e.total_fee, e.total_penalty_fee];
        const contentStr = contentArr.toString() + '\n';
        contents.push(contentStr);
      });
    }
    if (!contents.length) {
      return null;
    }
    return await Helper.createCSV(headers.toString(), contents);
  }

  public async calculateMerchantRating() {
    this.log.debug(`Start implement calculateMerchantRating`);
    const results = await wrap(this.getLatestMerchantRatingRedisKey(), async () => {
      const volumes = await this.volumeRepository.getMerchantVolume();
      if (volumes && volumes.length > 0) {
        const merchantRatings: CalculateMerchantRating[] = volumes.map((vl) => {
          return {
            operationId: vl.operationId,
            totalOrder: Number(vl.numberTransactionBuy) + Number(vl.numberTransactionSell),
            totalSuccessOrder: Number(vl.numberTransactionSuccess),
            merchantManagerId: vl.merchantManagerId,
          };
        });
        this.log.debug(`Stop implement calculateMerchantRating`);
        return merchantRatings;
      }
      this.log.debug(`Stop implement calculateMerchantRating`);
      return null;
    });
    this.log.debug(`Stop implement calculateMerchantRating`);
    return results;
  }

  public getDays() {
    return _.range(MAX_CHART_COLUMN, -1, -1)
      .map((idx) => moment().utc().subtract(idx, 'd'))
      .map((m) => m.format('YYYY-MM-DD'))
      .map((date) => ({ date }));
  }

  public getWeeks() {
    const weeks = [];
    const dateStart = moment().utc().subtract(MAX_CHART_COLUMN, 'weeks');
    const dateEnd = moment().utc();
    while (dateEnd.diff(dateStart, 'weeks') >= 0) {
      weeks.push({
        week: dateStart.week(),
        year: Number(dateStart.format('YYYY')),
      });
      dateStart.add(1, 'weeks');
    }
    return weeks;
  }

  public getMonths() {
    const months = [];
    const dateStart = moment().utc().subtract(MAX_CHART_COLUMN, 'months');
    const dateEnd = moment().utc().add(1, 'months');
    while (dateEnd.diff(dateStart, 'months') > 0) {
      months.push({
        month: Number(dateStart.format('M')),
        year: Number(dateStart.format('YYYY')),
      });
      dateStart.add(1, 'month');
    }
    return months;
  }

  public handleVolumeData(params: any) {
    const { data, type } = params;
    if (type === 'day') {
      const days = this.getDays();
      return days.map((e) => {
        const item = data.find((d) => d.date.includes(e.date.replace(/-/g, '')));
        return {
          time: moment(new Date(e.date)).format('DD/MM'),
          amount_transaction: Number(item?.amountTransaction || 0),
          total_fee: Number(item?.totalFee || 0),
          total_penalty_fee: Number(item?.totalPenaltyFee || 0),
        };
      });
    } else {
      const dataMapping = type === 'week' ? this.getWeeks() : this.getMonths();
      return dataMapping.map((e) => {
        const item = data.find(
          (d) => Number(d[type]) === Number(e[type]) && (d['year'] ? Number(d['year']) === Number(e.year) : true)
        );
        return {
          time: type === 'week' ? `Tuần ${e[type]}` : `${e[type]}/${e.year}`,
          amount_transaction: Number(item?.amountTransaction || 0),
          total_fee: Number(item?.totalFee || 0),
          total_penalty_fee: Number(item?.totalPenaltyFee || 0),
        };
      });
    }
  }

  public async getStatisticByDate(currentUser: Operation | User, startDate: Date, endDate: Date ) {
    return await this.orderRepository.getStatisticByDate(currentUser, {
      endDate,
      startDate,
    });
  }

  public getStatisticCacheKey(userId: string) {
    return `${STATISTIC_CACHE_KEY}${userId}`;
  }

  public async clearAllManagerStatisticCacheKeys() {
    await deleteCacheWildcard(`${STATISTIC_CACHE_KEY}*`);
  }

  private getLatestMerchantRatingRedisKey() {
    return CACHE_REDIS_LATEST_MERCHANT_RATING_KEY;
  }
}
