import { getConnection, SelectQueryBuilder } from 'typeorm';

import { LoggerInterface } from '@base/decorators/Logger';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { PaginationInput, SortOrder } from '@api/common/types';
import { DEFAULT_PAGINATION_PAGE, MAX_PAGINATION_LIMIT, MIN_PAGINATION_LIMIT } from '@api/common/models/P2PConstant';
import { SELL_ORDER_STEP } from '@api/order/models/Order';

export abstract class RepositoryBase<T> extends BaseRepository<T> {
  public log: LoggerInterface;

  constructor(log: LoggerInterface) {
    super();
    this.log = log;
  }

  public async saves(...args: any[]): Promise<boolean> {
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();
    try {
      for (const entity of args) {
        await queryRunner.manager.save(entity);
      }
      await queryRunner.commitTransaction();
      return true;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return false;
  }

  protected buildPagination(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationInput & Record<any, any>
  ): SelectQueryBuilder<T> {
    const { limit, page } = this.parseTakeSkipParams(options);
    if (limit && page) {
      queryBuilder.skip(limit * (page - 1)).take(limit);
    }
    return queryBuilder;
  }

  protected buildSorting(
    queryBuilder: SelectQueryBuilder<T>,
    sort: Record<string, SortOrder>[]
  ): SelectQueryBuilder<T> {
      sort.forEach((obj) => {
        queryBuilder.addOrderBy(
          `${queryBuilder.alias}.${Object.keys(obj)[0]}`,
          Object.values(obj)[0].toUpperCase() as any
        );
      });
    return queryBuilder;
  }

  protected buildDefaultOrderSorting(
    queryBuilder: SelectQueryBuilder<T>
  ): SelectQueryBuilder<T> {
    const sellStepPriority = [
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
    ]
      queryBuilder
        .addSelect(`TIMESTAMPDIFF(SECOND, NOW(), order.endedTime)`, 'timeout')
        .addSelect(`CASE WHEN order.step IN (:...sellStepPriority) AND order.type = 'SELL' THEN order.step ELSE 0 END`, 'priority')
        .addOrderBy("timeout", 'ASC')
        .addOrderBy("priority", 'DESC')
        .addOrderBy(`order.createdTime`, 'ASC')
        .setParameter('sellStepPriority', sellStepPriority);
    return queryBuilder;
  }

  protected parseTakeSkipParams(options: PaginationInput & Record<any, any>): { limit: number; page: number } {
    let { limit, page } = options;
    if (!limit || !page) {
      return {
        limit: null,
        page: null,
      };
    }
    limit = Math.min(Math.max(limit, MIN_PAGINATION_LIMIT), MAX_PAGINATION_LIMIT);
    page = Math.max(page, DEFAULT_PAGINATION_PAGE);
    return {
      limit,
      page,
    };
  }
}
