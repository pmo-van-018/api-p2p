import { EntityRepository, SelectQueryBuilder, Brackets } from 'typeorm';

import { Operation } from '@api/profile/models/Operation';
import { FindAllMerchants, FindOperatorExceptSuperAdmin } from '@api/profile/types/Operation';
import { DateFormat } from '@api/infrastructure/helpers/DateFormat';
import {OperationType, PostStatus, SearchType, TradeType} from '@api/common/models/P2PEnum';
import moment from 'moment';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { Appeal } from '@api/appeal/models/Appeal';
import { Post } from '@api/post/models/Post';
import { AuditableRepository } from '@api/infrastructure/abstracts/AuditableRepository';
import { FindAdminSupporterRequest } from '@api/profile/requests/FindAdminSupporterRequest';

@EntityRepository(Operation)
export class OperationRepository extends AuditableRepository<Operation> {
  public async statisticOperationsByStatus(operationType?: OperationType[]) {
    const query = this.createQueryBuilder('operation');
    query.where('operation.type IN (:operationType)', { operationType });
    query.select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive');
    query
      .select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive')
      .addSelect('SUM(CASE WHEN operation.status = 2 THEN 1 ELSE 0 END)', 'totalInactive')
      .addSelect('SUM(CASE WHEN operation.status = 3 THEN 1 ELSE 0 END)', 'totalBlock')
      .addSelect('SUM(CASE WHEN operation.status = 4 THEN 1 ELSE 0 END)', 'totalDelete');
    return query.getRawOne();
  }

  public async statisticStaffByManager(merchantManagerId: string) {
    const query = this.createQueryBuilder('operation');
    query.where('operation.merchantManagerId = :merchantManagerId').setParameters({ merchantManagerId });
    query.andWhere('operation.type IN (:types)', { types: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER] });
    query.select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive');
    query
      .select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive')
      .addSelect('SUM(CASE WHEN operation.status = 2 THEN 1 ELSE 0 END)', 'totalInactive')
      .addSelect('SUM(CASE WHEN operation.status = 3 THEN 1 ELSE 0 END)', 'totalBlock')
      .addSelect('SUM(CASE WHEN operation.status = 4 THEN 1 ELSE 0 END)', 'totalDelete');
    return query.getRawOne();
  }

  public async findAllMerchants(options: FindAllMerchants) {
    const queryBuilder = await this.buildOptionsGetAllMerchants(options);
    return queryBuilder.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
  }

  public async findAllAdmins(types?: OperationType[]): Promise<Operation[]> {
    const queryBuilder = this.createQueryBuilder('operation').where('operation.type IN(:...types)', {
      types: types || [OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER],
    });
    return queryBuilder.getMany();
  }

  public async searchAllAdmins(query: FindAdminSupporterRequest, type: OperationType, withDeleted?: boolean): Promise<[Operation[], number]> {
    const { startDate, endDate, status, searchField, searchValue, page, limit } = query;
    const queryBuilder = this.createQueryBuilder('operation')
      .where('operation.type = :type', { type })
      .orderBy('operation.status', 'ASC')
      .addOrderBy('operation.createdAt', 'DESC')
    if (withDeleted) {
      queryBuilder.withDeleted();
    }
    if (startDate) {
      const startDateUtc = moment(startDate).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      queryBuilder.andWhere('operation.createdAt > :startDate', { startDate: startDateUtc });
    }
    if (endDate) {
      const endDateUtc = moment(endDate).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      queryBuilder.andWhere('operation.createdAt < :endDate', { endDate: endDateUtc });
    }
    if (status) {
      const listStatus = status.split(',');
      queryBuilder.andWhere('operation.status IN (:...status)', { status: listStatus});
    }
    if (searchValue) {
      if (searchField === SearchType.NICK_NAME) {
        queryBuilder.andWhere('operation.nickName Regexp :search', { search: searchValue });
      } else {
        queryBuilder.andWhere('operation.walletAddress = :search', { search: searchValue });
      }
    }

    if (page && limit) {
      this.buildPagination(queryBuilder, { limit, page });
    }
    return queryBuilder.getManyAndCount();
  }

  public async statisticByStatus(operationTypes?: OperationType[], merchantManagerId?: string) {
    const query = this.createQueryBuilder('operation');
    if (operationTypes) {
      query.where('operation.type IN (:operationTypes)', { operationTypes });
    } else {
      query.where('operation.type != :operationTypes', { operationTypes: OperationType.SUPER_ADMIN });
    }
    query.select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive');
    if (merchantManagerId) {
      query.andWhere('operation.merchantManagerId = :merchantManagerId').setParameters({ merchantManagerId });
    }
    query
      .select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive')
      .addSelect('SUM(CASE WHEN operation.status = 2 THEN 1 ELSE 0 END)', 'totalInactive')
      .addSelect('SUM(CASE WHEN operation.status = 3 THEN 1 ELSE 0 END)', 'totalBlock')
      .addSelect('SUM(CASE WHEN operation.status = 4 THEN 1 ELSE 0 END)', 'totalDelete');
    return query.getRawOne();
  }

  public async statisticManagerByStatus(operationTypes?: OperationType[]) {
    const query = this.createQueryBuilder('operation');
    query.where('operation.type IN (:operationTypes)', { operationTypes });
    query.select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive');
    query
      .select('SUM(CASE WHEN operation.status = 1 THEN 1 ELSE 0 END)', 'totalActive')
      .addSelect('SUM(CASE WHEN operation.status = 2 THEN 1 ELSE 0 END)', 'totalInactive')
      .addSelect('SUM(CASE WHEN operation.status = 3 THEN 1 ELSE 0 END)', 'totalBlock')
      .addSelect('SUM(CASE WHEN operation.status = 4 THEN 1 ELSE 0 END)', 'totalDelete');
    return query.getRawOne();
  }

  public async getAllMerchantOperator(options: any): Promise<Operation[]> {
    return await this.buildOptionsGetUsersByStatusAndType(options).getMany();
  }

  public async getAllSupporterProcessing(managerId: string): Promise<Operation[]> {
    return await this.createQueryBuilder('operation')
      .where('operation.merchantManagerId = :managerId', { managerId })
      .andWhere('operation.type = :type', { type: OperationType.MERCHANT_SUPPORTER })
      .getMany();
  }

  public async getActiveOperationsInRange(): Promise<Operation[]> {
    return this.createQueryBuilder('operation')
      .leftJoinAndSelect('operation.statistic', 'statistic')
      .where('operation.type IN (:...types)', { types: [OperationType.MERCHANT_OPERATOR] })
      .getMany();
  }

  public async findAllSupportersByManagerId(managerId: string): Promise<Operation[]> {
    return this.createQueryBuilder('operation')
      .where(`operation.type = :type`, { type: OperationType.MERCHANT_SUPPORTER })
      .andWhere(`operation.merchant_manager_id = :managerId`, { managerId })
      .getMany();
  }

  public async calculateRevenueManager(filter: ExportReportRequest) {
    const queryBuilder = this.createQueryBuilder('operation')
      .withDeleted()
      .leftJoin((sub) => this.buildSubQuery(filter, sub), 'order_sum', 'order_sum.merchant_manager_id = operation.id')
      .select('SUM(order_sum.total_fee) as total_fee')
      .addSelect('SUM(order_sum.total_penalty_fee) as total_penalty_fee')
      .addSelect('SUM(order_sum.number_transaction_success) as number_transaction_success')
      .addSelect('SUM(order_sum.number_transaction_cancelled) as number_transaction_cancelled')
      .addSelect('SUM(order_sum.number_transaction_appeal) as number_transaction_appeal')
      .addSelect('MIN(operation.wallet_address) as wallet_address')
      .addSelect('MIN(operation.nick_name) as nick_name')
      .addSelect('MIN(operation.deleted_at) as deleted_at')
      .addSelect('operation.id as operation_id')
      .where('operation.type = :type', { type: OperationType.MERCHANT_MANAGER })
      .groupBy('operation.id');
    if (filter.managerIds?.length) {
      queryBuilder.andWhere('operation.id IN (:...managerIds)', { managerIds: filter.managerIds });
    }
    return queryBuilder.stream();
  }

  public async getOperatorStatisticData(managerId: string) {
    const queryBuilder = this.createQueryBuilder('operation')
      .withDeleted()
      .leftJoin(Order, 'order', `order.merchant_id = operation.id`)
      .leftJoin(Appeal, 'appeal', `appeal.id = order.appeal_id`)
      .leftJoin((qb) =>
        qb.from(Post, 'post')
          .innerJoin(Operation, 'op', 'op.id = post.merchant_id')
          .select(`SUM(CASE WHEN post.type = 'BUY' THEN 1 ELSE 0 END)`, 'post_buy_total')
          .addSelect(`SUM(CASE WHEN post.type = 'SELL' THEN 1 ELSE 0 END)`, 'post_sell_total')
          .addSelect('post.merchant_id', 'merchant_id')
          .where('op.merchant_manager_id = :managerId', { managerId })
          .groupBy('post.merchant_id')
        , 'sub_post', 'sub_post.merchant_id = operation.id')
      .select('operation.id', 'id')
      .addSelect('MIN(operation.wallet_address)', 'wallet_address')
      .addSelect('MIN(operation.nick_name)', 'nick_name')
      .addSelect('MIN(operation.last_login_at)', 'last_login_at')
      .addSelect('MIN(operation.status)', 'status')
      .addSelect('MIN(operation.created_at)', 'created_at')
      .addSelect('MIN(operation.updated_at)', 'updated_at')
      .addSelect('MIN(operation.deleted_at)', 'deleted_at')
      .addSelect(`MIN(sub_post.post_buy_total)`, 'post_buy_total')
      .addSelect(`MIN(sub_post.post_sell_total)`, 'post_sell_total')
      .addSelect(`SUM(CASE WHEN (order.status = ${OrderStatus.COMPLETED}) OR (order.status = ${OrderStatus.CANCELLED} AND order.appeal_id IS NOT NULL AND appeal.decision_result != 5) THEN 1 ELSE 0 END)`, 'order_total')
      .addSelect(`SUM(CASE WHEN order.status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'order_completed_total')
      .addSelect(`SUM(CASE WHEN order.type = 'SELL' AND order.status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'order_buy_completed_total')
      .addSelect(`SUM(CASE WHEN order.type = 'BUY' AND order.status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'order_sell_completed_total')
      .addSelect(`SUM(CASE WHEN order.status = ${OrderStatus.CANCELLED} THEN 1 ELSE 0 END)`, 'order_cancelled_total')
      .addSelect(`SUM(CASE WHEN appeal.admin_id IS NOT NULL AND appeal.decision_result != 5 THEN 1 ELSE 0 END)`, 'order_appeal_total')
      .addSelect(`SUM(CASE WHEN order.status = ${OrderStatus.COMPLETED} THEN order.total_price ELSE 0 END)`, 'total_price')
      .addSelect(`SUM(order.total_fee)`, 'total_fee')
      .addSelect(`SUM(order.total_penalty_fee)`, 'total_penalty_fee')
      .where('operation.type = :type', { type: OperationType.MERCHANT_OPERATOR })
      .andWhere('operation.merchant_manager_id = :managerId', { managerId })
      .groupBy('operation.id')
      .orderBy('operation.updated_at', 'DESC');
    return queryBuilder.stream();
  }

  public async getSupporterStatisticData(managerId: string) {
    const queryBuilder = this.createQueryBuilder('operation')
      .withDeleted()
      .leftJoin(Order, 'order', `order.supporter_id = operation.id`)
      .leftJoin(Appeal, 'appeal', `appeal.id = order.appeal_id`)
      .select('operation.id', 'id')
      .addSelect('MIN(operation.wallet_address)', 'wallet_address')
      .addSelect('MIN(operation.nick_name)', 'nick_name')
      .addSelect('MIN(operation.last_login_at)', 'last_login_at')
      .addSelect('MIN(operation.status)', 'status')
      .addSelect('MIN(operation.created_at)', 'created_at')
      .addSelect('MIN(operation.updated_at)', 'updated_at')
      .addSelect('MIN(operation.deleted_at)', 'deleted_at')
      .addSelect('SUM(CASE WHEN appeal.decision_result != 5 THEN 1 ELSE 0 END)', 'oder_received_total')
      .addSelect(`SUM(CASE WHEN appeal.operation_winner_id IS NOT NULL AND appeal.user_winner_id IS NULL THEN 1 ELSE 0 END)`, 'oder_win_total')
      .addSelect(`SUM(CASE WHEN appeal.operation_winner_id IS NULL AND appeal.user_winner_id IS NOT NULL THEN 1 ELSE 0 END)`, 'oder_lose_total')
      .where('operation.type = :type', { type: OperationType.MERCHANT_SUPPORTER })
      .andWhere('operation.merchant_manager_id = :managerId', { managerId })
      .groupBy('operation.id')
      .orderBy('operation.updated_at', 'DESC');
    return queryBuilder.stream();
  }

  public async getManagerStatistic(filter: ExportReportRequest) {
    const queryBuilder = this.createQueryBuilder('operation')
      .withDeleted()
      .innerJoin((sub) => this.subqueryManagerStatisticReport(filter, sub), 'sub_statistic', 'sub_statistic.merchant_manager_id = operation.id')
      .addSelect('(SELECT COUNT(op.id) FROM operations op WHERE op.merchant_manager_id = operation.id AND op.deleted_at IS NULL)', 'staff_total')
      .addSelect('sub_statistic.post_total', 'post_total')
      .addSelect('sub_statistic.post_online_total', 'post_online_total')
      .addSelect('sub_statistic.order_total', 'order_total')
      .addSelect('sub_statistic.order_completed_total', 'order_completed_total')
      .addSelect('sub_statistic.order_appeal_total', 'order_appeal_total')
      .addSelect('sub_statistic.total_price', 'total_price')
      .addSelect('sub_statistic.total_fee', 'total_fee')
      .addSelect('sub_statistic.total_penalty_fee', 'total_penalty_fee')
      .addSelect('operation.id', 'id')
      .addSelect('operation.wallet_address', 'wallet_address')
      .addSelect('operation.nick_name', 'nick_name')
      .addSelect('operation.last_login_at', 'last_login_at')
      .addSelect('operation.status', 'status')
      .addSelect('operation.contract_from', 'contract_from')
      .addSelect('operation.created_at', 'created_at')
      .addSelect('operation.updated_at', 'updated_at')
      .addSelect('operation.deleted_at', 'deleted_at')
      .where('operation.type = :type', { type: OperationType.MERCHANT_MANAGER });
    return queryBuilder.stream();
  }

  public async lockOperationPessimistic(operationId: string) {
    return this.createQueryBuilder('operation')
      .setLock('pessimistic_write')
      .where('operation.id = :operationId', { operationId })
      .getOne();
  }

  public async getStatisticByOperationIds(operationIds: string[]): Promise<
    {
      operationId: string;
      postShownCount: number;
      orderWaitingCount: number;
      orderAppealCount: number;
      orderWaitingUserCount: number;
    }[]
  > {
    const queryBuilder = this.createQueryBuilder('operation')
      .withDeleted()
      .leftJoin(
        (qb) =>
          qb
            .from(Post, 'pt')
            .select('pt.merchant_id', 'merchant_id')
            .addSelect(`SUM(CASE WHEN pt.status = :postStatus THEN 1 ELSE 0 END)`, 'post_online_total')
            .groupBy('pt.merchant_id')
            .setParameter('postStatus', PostStatus.ONLINE),
        'post',
        'post.merchant_id = operation.id'
      )
      .leftJoin(
        (qb) =>
          qb
            .from(Order, 'od')
            .select('od.merchant_id', 'merchant_id')
            .addSelect(
              `
              SUM(
                CASE
                  WHEN
                  (od.type = :orderBuyType AND od.step IN (:...buyWaitingStep))
                  OR (od.type = :orderSellType AND od.step IN (:...sellWaitingStep))
                  THEN 1 ELSE 0
                END
              )
            `,
              'order_waiting_count'
            )
            .addSelect(
              `
              SUM(
                CASE
                  WHEN
                  (od.type = :orderBuyType AND od.step IN (:...buyWaitingUserStep))
                  OR (od.type = :orderSellType AND od.step IN (:...sellWaitingUserStep))
                  THEN 1 ELSE 0
                END
              )
            `,
              'order_waiting_user_count'
            )
            .addSelect(
              `
              SUM(
                CASE
                  WHEN
                  (od.type = :orderBuyType AND od.step IN (:...buyAppealStep))
                  OR (od.type = :orderSellType AND od.step IN (:...sellAppealStep))
                  THEN 1 ELSE 0
                END
              )
            `,
              'order_appeal_count'
            )
            .groupBy('od.merchant_id')
            .setParameter('orderBuyType', TradeType.BUY)
            .setParameter('buyWaitingStep', [
              BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
              BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
              BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
              BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
              BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
              BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
              BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
            ])
            .setParameter('orderSellType', TradeType.SELL)
            .setParameter('sellWaitingStep', [
              SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
              SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
            ])
            .setParameter('buyWaitingUserStep', [
              BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER,
              BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
            ])
            .setParameter('sellWaitingUserStep', [
              SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
              SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
              SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
              SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
              SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
            ])
            .setParameter('buyAppealStep', [
              BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
              BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
              BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
            ])
            .setParameter('sellAppealStep', [
              SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER,
              SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
            ]),
        'order',
        'order.merchant_id = operation.id'
      )
      .select('operation.id', 'operationId')
      .addSelect('COALESCE(post_online_total, 0)', 'postShownCount')
      .addSelect('COALESCE(order_waiting_count, 0)', 'orderWaitingCount')
      .addSelect('COALESCE(order_waiting_user_count, 0)', 'orderWaitingUserCount');

    if (operationIds?.length) {
      queryBuilder.andWhere('operation.id IN (:...operationIds)', { operationIds });
    }

    queryBuilder.addGroupBy('operation.id');
    return await queryBuilder.getRawMany();
  }

  public async findAllOperatorByMerchantManagerRefId(
    merchantManagerRefId: string
  ): Promise<Operation[]> {
    const queryBuilder = this.createQueryBuilder('operation')
      .leftJoinAndSelect('operation.merchantManager', 'merchantManager')
      .where('merchantManager.refId = :merchantManagerRefId', { merchantManagerRefId })
      .andWhere('operation.type = :type', { type: OperationType.MERCHANT_OPERATOR });
    return queryBuilder.getMany();
  }

  protected buildQuery() {
    return this.createQueryBuilder('operation')
      .withDeleted()
      .leftJoinAndSelect('operation.merchantOperators', 'merchantOperator')
      .leftJoinAndSelect('operation.masterDataLevel', 'masterDataLevel')
      .leftJoinAndSelect('operation.statistic', 'statistic')
      .leftJoinAndSelect('operation.merchantManager', 'merchantManager');
  }

  protected async buildOptionsGetAllMerchants(options: FindAllMerchants): Promise<SelectQueryBuilder<Operation>> {
    const { status, types, merchantLevels, merchantManagerIds, search, startDate, endDate, limit, page } =
      await this.parseOptions(options);

    const queryBuilder = this.buildQuery();

    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.where('operation.status IN (:...status)');
      } else {
        queryBuilder.where('operation.status = :status');
      }
      queryBuilder.setParameter('status', status);
    }

    if (types) {
      if (Array.isArray(types)) {
        queryBuilder.andWhere('operation.type IN (:types)');
      } else {
        queryBuilder.andWhere('operation.type = :types');
      }
      queryBuilder.setParameter('types', types);
    }

    if (merchantManagerIds) {
      if (Array.isArray(merchantManagerIds)) {
        queryBuilder.andWhere('operation.merchantManagerId IN (:...merchantManagerIds)');
      } else {
        queryBuilder.andWhere('operation.merchantManagerId = :merchantManagerIds');
      }
      queryBuilder.setParameter('merchantManagerIds', merchantManagerIds);
    }

    if (merchantLevels) {
      if (Array.isArray(merchantLevels)) {
        queryBuilder.andWhere('operation.merchantLevel IN (:...merchantLevel)');
      } else {
        queryBuilder.andWhere('operation.merchantLevel = :merchantLevels');
      }
      queryBuilder.setParameter('merchantLevels', merchantLevels);
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('operation.createdAt BETWEEN :startDate AND :endDate', {
        startDate: DateFormat.formatStartDate(startDate),
        endDate: DateFormat.formatEndDate(endDate),
      });
    }

    if (search) {
      const relevance = 'operation.nickName Regexp :search';
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(relevance, { search }).orWhere('operation.walletAddress LIKE :search', { search });
        })
      );
      queryBuilder.addSelect(relevance, 'relevance');
      queryBuilder.orderBy('relevance', 'DESC');
    }

    if (page && limit) {
      this.buildPagination(queryBuilder, { limit, page });
    }

    queryBuilder
      .addSelect(
        `(
      case
        when operation.status <> 1 and (statistic.order_appeal_count > 0 or statistic.order_waiting_count > 0 or statistic.order_waiting_user_count > 0) then operation.updatedAt
        when operation.status = 1 then DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
        else DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 2 DAY)
      end)`,
        'staff_ordering'
      )
      .addOrderBy('staff_ordering', 'ASC')
      .addOrderBy('operation.updatedAt', 'DESC');

    return queryBuilder;
  }

  protected buildOptionsGetUsersByStatusAndType(options: FindOperatorExceptSuperAdmin) {
    const { merchantManagerId, status, types } = options;
    const queryBuilder = this.buildQuery();
    if (Array.isArray(types)) {
      queryBuilder.where('operation.type IN (:...types)');
    } else {
      queryBuilder.where('operation.type = :types');
    }
    queryBuilder.setParameter('types', types);

    if (merchantManagerId) {
      queryBuilder.andWhere('operation.merchantManagerId = :merchantManagerId').setParameters({ merchantManagerId });
    }

    if (Array.isArray(status)) {
      queryBuilder.andWhere('operation.status IN (:...status)');
    } else {
      queryBuilder.andWhere('operation.status = :status');
    }
    queryBuilder.setParameters({ status });
    return queryBuilder;
  }

  protected async parseOptions<T extends {}>(options: T): Promise<T> {
    const result: any = {};
    await Promise.all(
      Object.entries(options).map((obj) => {
        result[obj[0]] = Array.isArray(obj[1]) && obj[1]?.length ? obj[1] : !Array.isArray(obj[1]) ? obj[1] : null;
      })
    );
    return result;
  }

  private buildSubQuery(filter: ExportReportRequest, queryBuilder: SelectQueryBuilder<any>) {
    const subQueryBuilder = queryBuilder
      .from(Order, 'ord')
      .withDeleted()
      .innerJoin(Operation, 'opn', 'opn.id = ord.merchant_id')
      .leftJoin(Appeal, 'appeal', 'appeal.id = ord.appeal_id')
      .select('SUM(CASE WHEN ord.status = 4 THEN ord.total_fee ELSE 0 END) as total_fee')
      .addSelect('SUM(ord.total_penalty_fee) as total_penalty_fee')
      .addSelect('SUM(CASE WHEN ord.status = 4 THEN 1 ELSE 0 END) as number_transaction_success')
      .addSelect(
        'SUM(CASE WHEN ord.status = 5 AND ord.appeal_id IS NOT NULL AND appeal.decision_result != 5 THEN 1 ELSE 0 END) as number_transaction_cancelled'
      )
      .addSelect(
        'SUM(CASE WHEN ord.appeal_id IS NOT NULL AND appeal.admin_id IS NOT NULL AND appeal.decision_result != 5 THEN 1 ELSE 0 END) as number_transaction_appeal'
      )
      .addSelect('opn.merchant_manager_id as merchant_manager_id')
      .where('ord.completed_time BETWEEN :from AND :to', { from: filter.startDate, to: filter.endDate })
      .groupBy('opn.merchant_manager_id');
    if (filter.assetIds?.length) {
      subQueryBuilder.andWhere('ord.asset_id IN (:...assetIds)', { assetIds: filter.assetIds });
    }
    if (filter.tradeType) {
      subQueryBuilder.andWhere('ord.type = :tradeType', { tradeType: filter.tradeType });
    }
    return subQueryBuilder;
  }

  private subqueryManagerStatisticReport(filter: ExportReportRequest, queryBuilder: SelectQueryBuilder<any>) {
    const subQueryBuilder = queryBuilder
      .from(Operation, 'op')
      .withDeleted()
      .leftJoin((qb) =>
          qb.from(Post, 'pt')
            .select('pt.merchant_id', 'merchant_id')
            .addSelect('COUNT(pt.id)', 'post_total')
            .addSelect(`SUM(CASE WHEN pt.status = ${PostStatus.ONLINE} THEN 1 ELSE 0 END)`, 'post_online_total')
            .groupBy('pt.merchant_id')
        , 'post', 'post.merchant_id = op.id')
      .leftJoin((qb) =>
          qb.from(Order, 'od')
            .leftJoin(Appeal, 'ap', 'ap.id = od.appeal_id')
            .select('od.merchant_id', 'merchant_id')
            .addSelect(`SUM(CASE WHEN od.status = ${OrderStatus.COMPLETED} THEN od.total_price ELSE 0 END)`, 'total_price')
            .addSelect(`SUM(CASE WHEN od.status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'order_completed_count')
            .addSelect(`SUM(CASE WHEN od.status = ${OrderStatus.COMPLETED} THEN od.total_fee ELSE 0 END)`, 'total_fee')
            .addSelect('SUM(od.total_penalty_fee)', 'total_penalty_fee')
            // tslint:disable-next-line:max-line-length
            .addSelect(`SUM(CASE WHEN od.appeal_id IS NOT NULL AND ap.admin_id IS NOT NULL AND ap.decision_result != 5 THEN 1 ELSE 0 END)`, 'order_appeal_count')
            .addSelect(`SUM(CASE WHEN (od.status = ${OrderStatus.COMPLETED}) OR (od.status = ${OrderStatus.CANCELLED} AND od.appeal_id IS NOT NULL AND ap.decision_result != 5) THEN 1 ELSE 0 END)`, 'total_order_count')
            .where('od.completed_time BETWEEN :from AND :to', { from: filter.startDate, to: filter.endDate })
            .groupBy('od.merchant_id')
        , 'order', 'order.merchant_id = op.id')
      .addSelect('op.merchant_manager_id', 'merchant_manager_id')
      .addSelect('SUM(order.total_order_count)', 'order_total')
      .addSelect('SUM(order.order_completed_count)', 'order_completed_total')
      .addSelect('SUM(order.order_appeal_count)', 'order_appeal_total')
      .addSelect('SUM(order.total_price)', 'total_price')
      .addSelect('SUM(post.post_total)', 'post_total')
      .addSelect(`SUM(post.post_online_total)`, 'post_online_total')
      .addSelect('SUM(order.total_fee)', 'total_fee')
      .addSelect('SUM(order.total_penalty_fee)', 'total_penalty_fee')
      .where('op.type IN (:...types)', { types: [ OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER]})
      .groupBy('op.merchant_manager_id');
    if (filter.managerIds?.length) {
      subQueryBuilder.andWhere('op.merchant_manager_id IN (:...managerIds)', { managerIds: filter.managerIds });
    }
    return subQueryBuilder;
  }
}
