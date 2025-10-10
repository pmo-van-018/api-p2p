/* eslint-disable no-unsafe-optional-chaining */
import { EntityRepository } from 'typeorm';
import { Statistic } from '@api/statistic/models/Statistic';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { Operator, OperatorAndCount, StatisticDataTypes } from '@api/statistic/types/Statistic';
import { SqlUtil } from '@base/utils/sql.util';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';

@EntityRepository(Statistic)
export class StatisticRepository extends RepositoryBase<Statistic> {
  public async updateStatisticWithOperatorOrUser<
    O extends Operator | OperatorAndCount,
    S extends {
      [K in keyof StatisticDataTypes]?: O;
    }
  >(options?: {
    operationId?: string, userId?: string, statistic: S | any, lastCountAt?: Date
  }) {
    const getCount = (operator: O) =>
      (operator as OperatorAndCount)?.count ? (operator as OperatorAndCount)?.count : (operator as unknown as Operator) ? 1 : null;
    const getOperator = (value: O) => (value as OperatorAndCount)?.operator ?? value;

    const {
      postHideCount,
      postShownCount,
      orderWaitingCount,
      orderWaitingUserCount,
      orderCompletedCount,
      cancelOrderCount,
      totalOrderCount,
      totalBuyOrderCount,
      totalSellOrderCount,
      totalAmountCount,
      totalFeeCount,
      totalPenaltyFeeCount,
      monthOrderCount,
      monthOrderCompletedCount,
      orderAppealCount,
      averageCancelledTime,
      averageCompletedTime,
    } = options?.statistic;

    const operationId = options?.operationId || null;
    const userId = options?.userId || null;
    const lastCountAt = options?.lastCountAt || null;

    const queryBuilder = this.createQueryBuilder('statistic').update(Statistic);

    if (operationId) {
    queryBuilder
      .where('statistics.operation_id = :operationId', {
        operationId,
      });
    }

    if (userId) {
      queryBuilder
        .where('statistics.user_id = :userId', {
          userId,
        });
    }

    queryBuilder
      .set({
        ...(postHideCount && { postHideCount: () => `post_hide_count ${getOperator(postHideCount)} :postHideCount` }),
        ...(postShownCount && {
          postShownCount: () => `post_shown_count ${getOperator(postShownCount)} :postShownCount`,
        }),
        ...(orderWaitingCount && {
          orderWaitingCount: () => `order_waiting_count ${getOperator(orderWaitingCount)} :orderWaitingCount`,
        }),
        ...(orderWaitingUserCount && {
          orderWaitingUserCount: () =>
            `order_waiting_user_count ${getOperator(orderWaitingUserCount)} :orderWaitingUserCount`,
        }),
        ...(orderAppealCount && {
          orderAppealCount: () => `order_appeal_count ${getOperator(orderAppealCount)} :orderAppealCount`,
        }),
        ...(orderCompletedCount && {
          orderCompletedCount: () => `order_completed_count ${getOperator(orderCompletedCount)} :orderCompletedCount`,
        }),
        ...(cancelOrderCount && {
          cancelOrderCount: () => `cancel_order_count ${getOperator(cancelOrderCount)} :cancelOrderCount`,
        }),
        ...(totalOrderCount && {
          totalOrderCount: () => `total_order_count ${getOperator(totalOrderCount)} :totalOrderCount`,
        }),
        ...(totalBuyOrderCount && {
          totalBuyOrderCount: () => `total_buy_order_count ${getOperator(totalBuyOrderCount)} :totalBuyOrderCount`,
        }),
        ...(totalSellOrderCount && {
          totalSellOrderCount: () => `total_sell_order_count ${getOperator(totalSellOrderCount)} :totalSellOrderCount`,
        }),
        ...(totalAmountCount && {
          totalAmountCount: () => `total_amount_count ${getOperator(totalAmountCount)} :totalAmountCount`,
        }),
        ...(totalFeeCount && {
          totalFeeCount: () => `total_fee_count ${getOperator(totalFeeCount)} :totalFeeCount`,
        }),
        ...(totalPenaltyFeeCount && {
          totalPenaltyFeeCount: () =>
            `total_penalty_fee_count ${getOperator(totalPenaltyFeeCount)} :totalPenaltyFeeCount`,
        }),
        ...(totalBuyOrderCount && {
          totalBuyOrderCount: () => `total_buy_order_count ${getOperator(totalBuyOrderCount)} :totalBuyOrderCount`,
        }),
        ...(totalSellOrderCount && {
          totalSellOrderCount: () => `total_sell_order_count ${getOperator(totalSellOrderCount)} :totalSellOrderCount`,
        }),
        ...(totalAmountCount && {
          totalAmountCount: () => `total_amount_count ${getOperator(totalAmountCount)} :totalAmountCount`,
        }),
        ...(totalFeeCount && {
          totalFeeCount: () => `total_fee_count ${getOperator(totalFeeCount)} :totalFeeCount`,
        }),
        ...(totalPenaltyFeeCount && {
          totalPenaltyFeeCount: () =>
            `total_penalty_fee_count ${getOperator(totalPenaltyFeeCount)} :totalPenaltyFeeCount`,
        }),
        ...(monthOrderCount && {
          monthOrderCount: () => `month_order_count ${getOperator(monthOrderCount)} :monthOrderCount`,
        }),
        ...(monthOrderCompletedCount && {
          monthOrderCompletedCount: () =>
            `month_order_completed_count ${getOperator(monthOrderCompletedCount)} :monthOrderCompletedCount`,
        }),
        ...(getCount(averageCancelledTime) && {
          averageCancelledTime: getCount(averageCancelledTime),
        }),
        ...(getCount(averageCompletedTime) && {
          averageCompletedTime: getCount(averageCompletedTime),
        }),
        ...(lastCountAt && { lastCountAt }),
      })
      .setParameters({
        postHideCount: getCount(postHideCount),
        postShownCount: getCount(postShownCount),
        orderWaitingCount: getCount(orderWaitingCount),
        orderWaitingUserCount: getCount(orderWaitingUserCount),
        orderAppealCount: getCount(orderAppealCount),
        orderCompletedCount: getCount(orderCompletedCount),
        cancelOrderCount: getCount(cancelOrderCount),
        totalOrderCount: getCount(totalOrderCount),
        totalBuyOrderCount: getCount(totalBuyOrderCount),
        totalSellOrderCount: getCount(totalSellOrderCount),
        totalAmountCount: getCount(totalAmountCount),
        totalFeeCount: getCount(totalFeeCount),
        totalPenaltyFeeCount: getCount(totalPenaltyFeeCount),
        monthOrderCount: getCount(monthOrderCount),
        monthOrderCompletedCount: getCount(monthOrderCompletedCount),
      });
    return queryBuilder.execute();
  }

  public async findOneMerchantManagerStatistic(merchantManager: Operation | User): Promise<Statistic> {
    const queryBuilder = this.createQueryBuilder('statistic');
    queryBuilder
      .andWhere(
        `statistic.operation_id IN (select operation.id from operations operation \
                WHERE operation.id = :merchantId \
                AND (operation.status IN(:...operationStatus) OR operation.deleted_at IS NOT NULL))`,
        {
          merchantId: merchantManager.id,
          operationStatus: [OperationStatus.INACTIVE, OperationStatus.BLOCKED],
        }
      )
      .select('SUM(post_shown_count)', 'postShownCount')
      .addSelect('SUM(post_hide_count)', 'postHideCount')
      .addSelect('SUM(total_order_count)', 'totalOrderCount')
      .addSelect('SUM(order_waiting_count)', 'orderWaitingCount')
      .addSelect('SUM(cancel_order_count)', 'cancelOrderCount')
      .addSelect('SUM(order_appeal_count)', 'orderAppealCount')
      .addSelect('SUM(order_waiting_user_count)', 'orderWaitingUserCount');
    return (await this.query(SqlUtil.buildRawSqlFromQueryBuilder(queryBuilder)))[0];
  }

  public async findOperatorStatisticByManager(merchantId: string): Promise<Statistic> {
    const queryBuilder = this.createQueryBuilder('statistic');
    queryBuilder
      .andWhere(
        `statistic.operation_id IN (select operation.id from operations operation \
                WHERE operation.merchant_manager_id = :merchantId \
                AND (operation.status IN(:...operationStatus) OR operation.deleted_at IS NOT NULL))`,
        {
          merchantId,
          operationStatus: [OperationStatus.INACTIVE, OperationStatus.BLOCKED],
        }
      )
      .select('SUM(post_shown_count)', 'postShownCount')
      .addSelect('SUM(post_hide_count)', 'postHideCount')
      .addSelect('SUM(total_order_count)', 'totalOrderCount')
      .addSelect('SUM(order_waiting_count)', 'orderWaitingCount')
      .addSelect('SUM(cancel_order_count)', 'cancelOrderCount')
      .addSelect('SUM(order_appeal_count)', 'orderAppealCount')
      .addSelect('SUM(order_waiting_user_count)', 'orderWaitingUserCount');
    return (await this.query(SqlUtil.buildRawSqlFromQueryBuilder(queryBuilder)))[0];
  }

  public async countAllOperator(merchantManagerId?: string) {
    const query = this.createQueryBuilder('statistic')
      .withDeleted()
      .innerJoinAndSelect('statistic.operation', 'operation');
    if (merchantManagerId) {
      query.where(
        'statistic.operationId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantManagerId)',
        { merchantManagerId }
      );
    } else {
      query.where('operation.type = :operationType', { operationType: OperationType.MERCHANT_OPERATOR });
    }
    query
      .select('SUM(post_shown_count)', 'postShownCount')
      .addSelect('SUM(total_amount_count)', 'totalAmountCount')
      .addSelect('SUM(total_fee_count)', 'totalFeeCount')
      .addSelect('SUM(total_penalty_fee_count)', 'totalPenaltyFeeCount')
      .addSelect('SUM(total_order_count)', 'totalOrderCount')
      .addSelect('SUM(total_buy_order_count)', 'totalBuyOrderCount')
      .addSelect('SUM(total_sell_order_count)', 'totalSellOrderCount');
    return query.getRawOne();
  }

  public async getOrderAverageTimeByManagerIds(managerIds: string[]) {
    const query = this.createQueryBuilder('statistic')
      .withDeleted()
      .innerJoin('statistic.operation', 'operation')
      .select('SUM(statistic.average_completed_time * statistic.order_completed_count)', 'totalCompletedTime')
      .addSelect('SUM(statistic.average_cancelled_time * (statistic.total_order_count - statistic.order_completed_count))', 'totalCancelledTime')
      .addSelect('SUM(statistic.order_completed_count)', 'totalCompletedCount')
      .addSelect('SUM(statistic.total_order_count - statistic.order_completed_count)', 'totalCancelledCount')
      .addSelect('operation.merchant_manager_id ', 'merchantManagerId')
      .where('operation.merchant_manager_id IN (:...managerIds)', { managerIds })
      .groupBy('operation.merchant_manager_id');
    return query.getRawMany();
  }
}
