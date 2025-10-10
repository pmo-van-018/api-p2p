import moment from 'moment';
import { EntityRepository } from 'typeorm';
import { Volume } from '@api/statistic/models/Volume';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { MONTHLY_DAYS_NUMBER } from '@api/order/constants/order';
import { Operation } from '@api/profile/models/Operation';
import { UserType, OperationType } from '@api/common/models/P2PEnum';
import { MAX_CHART_COLUMN } from '@api/common/date';

@EntityRepository(Volume)
export class VolumeRepository extends RepositoryBase<Volume> {
  public async getAll(chartParamsRequest: ChartParamsRequest, operationId: string, role: number): Promise<Volume[]> {
    const type = chartParamsRequest.type;
    const queryBuilder = this.buildQuery();
    if (role === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.where('volume.operation_id = :operationId', { operationId });
    }
    if (role === OperationType.MERCHANT_MANAGER) {
      queryBuilder.where(
        'volume.operation_id IN (select operation.id from operations operation where operation.merchant_manager_id = :operationId)',
        { operationId }
      );
    }
    if (role === OperationType.SUPER_ADMIN) {
      queryBuilder.where('volume.operation_id IN (select operation.id from operations operation where operation.type = :userType)', {
        userType: OperationType.MERCHANT_OPERATOR,
      });
    }
    const startDay = moment().utc().subtract(MAX_CHART_COLUMN, 'days').startOf('day').toDate();
    const startMonth = moment().utc().subtract(MAX_CHART_COLUMN, 'months').startOf('day').toDate();
    const startWeek = moment().utc().subtract(MAX_CHART_COLUMN, 'weeks').startOf('day').toDate();
    const startTimeQuery = type === 'day' ? startDay : type === 'week' ? startWeek : startMonth;
    const endTimeQuery = moment().utc().startOf('day').toDate();
    queryBuilder.andWhere('volume.dateTrans BETWEEN :startTimeQuery AND :endTimeQuery', {
      startTimeQuery,
      endTimeQuery,
    });
    queryBuilder.select('SUM(volume.amount_transaction)', 'amountTransaction');
    queryBuilder.addSelect('SUM(volume.total_fee)', 'totalFee');
    queryBuilder.addSelect('SUM(volume.total_penalty_fee)', 'totalPenaltyFee');
    if (type === 'day') {
      queryBuilder.addSelect(`AVG(DATE(volume.date_trans))`, 'date');
      queryBuilder.groupBy(`DATE(volume.date_trans)`);
    }
    if (type === 'week') {
      queryBuilder.addSelect(`AVG(WEEK(volume.date_trans))`, 'week');
      queryBuilder.groupBy(`WEEK(volume.date_trans)`);
    }
    if (type === 'month') {
      queryBuilder.addSelect(`AVG(YEAR(volume.date_trans))`, 'year');
      queryBuilder.addSelect(`AVG(MONTH(volume.date_trans))`, 'month');
      queryBuilder.groupBy(`MONTH(volume.date_trans)`);
    }
    return await queryBuilder.getRawMany();
  }

  public async getRecentVolumes (userId: string, userType: UserType | OperationType, numberMonthlyDays = MONTHLY_DAYS_NUMBER) {
    const buildQuery = this.buildQuery()
      .where(
      '(DATE(volume.date_trans) >= DATE_SUB(CURDATE(), INTERVAL :numberMonthlyDays DAY))',
      {
        numberMonthlyDays,
      }
    );
    if (userType === OperationType.MERCHANT_MANAGER) {
      buildQuery.andWhere('volume.operation_id IN (select operation.id from operations operation where operation.merchant_manager_id = :userId)', { userId });
    }
    if (userType === OperationType.SUPER_ADMIN) {
      buildQuery
        .andWhere('volume.operation_id IN (select operation.id from operations operation where operation.type = :userType)',
          { userType: OperationType.MERCHANT_OPERATOR }
        );
    }
    if (userType ===  OperationType.MERCHANT_OPERATOR) {
      buildQuery.andWhere('volume.operation_id = :userId', { userId });
    }
    if (userType ===  UserType.USER) {
      buildQuery.andWhere('volume.user_id = :userId', { userId });
    }
    buildQuery
      .withDeleted()
      .select('DATE(volume.date_trans)', 'createTime')
      .addSelect('SUM(volume.number_transaction_buy)', 'totalBuy')
      .addSelect('SUM(volume.number_transaction_sell)', 'totalSell')
      .addSelect('SUM(volume.number_transaction_success)', 'totalSuccess')
      .addSelect('SUM(volume.amount_transaction)', 'totalAmount')
      .addSelect('SUM(volume.total_fee)', 'totalFee')
      .addSelect('SUM(volume.total_penalty_fee)', 'totalPenaltyFee')
      .groupBy('DATE(volume.date_trans)');
    return buildQuery.getRawMany();
  }

  public async getMerchantVolume() {
    const startDate = moment().utc().subtract(6, 'months').startOf('day').toDate();
    const endDate = moment().utc().endOf('day').toDate();
    return this.createQueryBuilder('volume')
    .withDeleted()
    .innerJoin(Operation, 'user', 'user.id = volume.operation_id')
    .where('user.type = :type', {type: OperationType.MERCHANT_OPERATOR})
    .andWhere('volume.date_trans BETWEEN :startDate  AND :endDate', {startDate, endDate})
    .select('SUM(volume.numberTransactionSell)', 'numberTransactionSell')
    .addSelect('SUM(volume.numberTransactionBuy)', 'numberTransactionBuy')
    .addSelect('SUM(volume.numberTransactionSuccess)', 'numberTransactionSuccess')
    .addSelect('volume.operation_id', 'operationId')
    .addSelect('user.merchant_manager_id', 'merchantManagerId')
    .groupBy('volume.operation_id')
    .getRawMany();
  }
  public async accumulateRaw(id: string, payload: any) {
    const updateResult = await this.buildQuery()
      .update(Volume)
      .where('(volume.id = :id)', { id })
      .set({
        ...(payload.numberTransactionSell && {
          numberTransactionSell: () => 'number_transaction_sell + :numberTransactionSell',
        }),
        ...(payload.numberTransactionBuy && {
          numberTransactionBuy: () => 'number_transaction_buy + :numberTransactionBuy',
        }),
        ...(payload.numberTransactionSuccess && {
          numberTransactionSuccess: () => 'number_transaction_success + :numberTransactionSuccess',
        }),
        ...(payload.numberTransactionCancelled && {
          numberTransactionCancelled: () => 'number_transaction_cancelled + :numberTransactionCancelled',
        }),
        ...(payload.numberTransactionAppeal && {
          numberTransactionAppeal: () => 'number_transaction_appeal + :numberTransactionAppeal',
        }),
        ...(payload.amountTransaction && { amountTransaction: () => 'amount_transaction + :amountTransaction' }),
        ...(payload.totalFee && { totalFee: () => 'total_fee + :totalFee' }),
        ...(payload.totalPenaltyFee && { totalPenaltyFee: () => 'total_penalty_fee + :totalPenaltyFee' }),
      })
      .setParameters(payload)
      .execute();
    return updateResult?.raw;
  }
  private buildQuery() {
    return this.createQueryBuilder('volume');
  }
}
