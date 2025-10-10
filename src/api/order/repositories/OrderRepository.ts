import { isBoolean } from 'class-validator';
import { isUndefined } from 'lodash';
import { Brackets, EntityRepository, SelectQueryBuilder } from 'typeorm';

import { Appeal, BUY_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { BlacklistEntity } from '@api/blacklist/models/BlacklistEntity';
import {
  GroupTypeRevenue,
  OperationStatus,
  OperationType,
  TradeType,
  UserStatus,
  UserType,
} from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { MONTHLY_DAYS_NUMBER } from '@api/order/constants/order';
import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { FindOrderViaUserType, GetOrderRequestType, QueryOrderData, UserQueryOrder } from '@api/order/types/Order';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { RevenueAndPriceByPeriodRequest } from '@api/statistic/requests/RevenueAndPriceByPeriodRequest';
import { orderSumData } from '@api/statistic/types/Volume';
import { env } from '@base/env';
import { reverseTradeType } from '@base/utils/helper.utils';
import moment from 'moment';

type Steps = SELL_ORDER_STEP | BUY_ORDER_STEPS;

@EntityRepository(Order)
export class OrderRepository extends RepositoryBase<Order> {
  public async getParticipants(refId: string): Promise<Order> {
    return this.createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.merchant', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
      .leftJoinAndSelect('order.supporter', 'supporter')
      .leftJoinAndSelect('order.appeal', 'appeal')
      .where('order.refId = :refId', { refId })
      .getOne();
  }
  public getOneById({ user, id, type, status, hasAppeal, viewOnly, searchByRefId }: GetOrderRequestType) {
    const queryBuilder = this.buildQuery({ withDeleted: { merchant: true } })
      .setParameters({ id })
      .orderBy('cryptoTransaction.createdAt', 'ASC');
    if (searchByRefId) {
      queryBuilder.andWhere('order.refId = :id');
    } else {
      queryBuilder.andWhere('order.id = :id');
    }
    if (user && user.type === UserType.USER) {
      queryBuilder.andWhere('order.userId = :userId', {
        userId: user.id,
      });
    }
    if (user && user.type === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.andWhere('order.merchantId = :merchantId', {
        merchantId: user.id,
      });
    }

    if (user && user.type === OperationType.MERCHANT_SUPPORTER) {
      queryBuilder.andWhere(
        `order.merchantId IN (select operation.id from operations operation \
         where operation.merchant_manager_id = (select supporter.merchant_manager_id from operations supporter where supporter.id = :merchantId LIMIT 1))`,
        {
          merchantId: user.id,
        }
      );
    }

    if (user && user.type === OperationType.MERCHANT_MANAGER) {
      const operationStatus = [OperationStatus.INACTIVE, OperationStatus.BLOCKED];
      if (viewOnly) {
        operationStatus.push(OperationStatus.ACTIVE);
      }
      queryBuilder.andWhere(
        `order.merchantId IN (select operation.id from operations operation
          WHERE operation.merchant_manager_id = :merchantId
          AND (operation.status IN(:...operationStatus) OR operation.deleted_at IS NOT NULL))`,
        {
          merchantId: user.id,
          operationStatus,
        }
      );
    }
    if (type) {
      queryBuilder.andWhere('order.type = :type', {
        type,
      });
    }
    if (status && status.length > 0) {
      queryBuilder.andWhere('order.status IN (:status)', { status });
    }
    if (!isUndefined(hasAppeal)) {
      queryBuilder.andWhere(`order.appealId IS ${hasAppeal ? 'NOT' : ''} NULL`);
    }
    return queryBuilder.getOne();
  }

  public getFullInfoById(id: string) {
    return this.buildQuery({ withDeleted: { merchant: true } })
      .where('order.id = :id', { id })
      .setParameters({ id })
      .getOne();
  }

  public countTotalOrderProcessingByRole(currentUser: Operation) {
    const queryBuilder = this.createQueryBuilder('order')
      .select('COUNT(order.id)', 'total_order')
      .addSelect('order.type', 'type')
      .andWhere('order.status IN (:...orderStatus)', {
        orderStatus: [OrderStatus.TO_BE_PAID, OrderStatus.PAID, OrderStatus.CONFIRM_PAID],
      })
      .groupBy('order.type');
    if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      queryBuilder.andWhere(
        `order.merchantId IN (select operation.id from operations operation WHERE operation.merchant_manager_id = :merchantId)`,
        {
          merchantId: currentUser.id,
        }
      );
    }
    return queryBuilder.getRawMany();
  }

  public countOrderHasAppealTotal(managerId: string) {
    return this.createQueryBuilder('order')
      .select('COUNT(order.id)', 'order_total')
      .leftJoin(Appeal, 'appeal', 'appeal.id = order.appeal_id')
      .where('order.appeal_id IS NOT NULL AND appeal.decision_result != 5')
      .andWhere(
        `order.merchantId IN (select operation.id from operations operation WHERE operation.merchant_manager_id = :merchantId)`,
        {
          merchantId: managerId,
        }
      )
      .getRawOne();
  }

  public getOneByRefId(refId: string) {
    const queryBuilder = this.buildQuery({ withDeleted: { merchant: true } })
      .where('order.refId = :refId')
      .setParameters({ refId });
    return queryBuilder.getOne();
  }

  public getSellOrderByRefId(refId: string, userId?: string) {
    const queryBuilder = this.buildQuery({ withDeleted: { merchant: true } })
      .where('order.refId = :refId', { refId })
      .andWhere('order.type = :type', { type: TradeType.SELL });
    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }
    return queryBuilder.getOne();
  }

  public countTotalTransactionConfirmation() {
    const queryBuilder = this.createQueryBuilder('order')
      .where('order.type = :type', { type: TradeType.SELL })
      .andWhere('order.status = :status', { status: OrderStatus.TO_BE_PAID })
      .andWhere('order.step = :step', { step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER })
      .andWhere('order.roomId IS NOT NULL');
    return queryBuilder.getCount();
  }

  public getListTransactionFailed(request: PaginationQueryRequest) {
    const queryBuilder = this.createQueryBuilder('order')
      .innerJoinAndSelect('order.asset', 'asset')
      .innerJoinAndSelect('order.fiat', 'fiat')
      .where('order.status = :status', { status: OrderStatus.TO_BE_PAID })
      .andWhere('order.step = :step', { step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER })
      .andWhere('order.type = :type', { type: TradeType.SELL })
      .andWhere('order.roomId IS NOT NULL')
      .limit(request.limit)
      .offset(request.limit * (request.page - 1))
      .orderBy('order.updatedAt', 'ASC');
    return queryBuilder.getManyAndCount();
  }

  public getOrderByRefIdWithLock(refId: string, type: TradeType) {
    const queryBuilder = this.buildQuery()
      .setLock('pessimistic_write')
      .where('order.refId = :refId')
      .andWhere('order.type = :type')
      .setParameters({ refId, type });
    return queryBuilder.getOne();
  }

  public lockOrderByRefId(refId: string) {
    return this.createQueryBuilder('order')
      .setLock('pessimistic_write')
      .where('order.refId = :refId')
      .setParameters({ refId })
      .getOne();
  }

  public getOneByAppealId(AppealId: string) {
    const queryBuilder = this.buildQuery({ withDeleted: { '*': true } })
      .where('order.appealId = :AppealId')
      .setParameters({ AppealId });
    return queryBuilder.getOne();
  }

  public countByMerchantAndStatus(merchantId: string, merchantType: OperationType, status: number[]) {
    const query = this.buildQuery({
      withDeleted: { user: true, merchant: true, operationWinner: true, userWinner: true, admin: true },
    });
    if (merchantType === OperationType.MERCHANT_OPERATOR) {
      query.where('order.merchantId = :merchantId').setParameters({ merchantId });
    }
    if (merchantType === OperationType.MERCHANT_MANAGER) {
      query.where(
        'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
        {
          merchantId,
        }
      );
    }
    if (status.length > 0) {
      query.andWhere('order.status IN (:status)').setParameters({ status });
    }
    return query.getCount();
  }

  public countByMerchantAndPaymentMethodId(merchantId: string, paymentMethodId: string, status: number[]) {
    const query = this.buildQuery({
      withDeleted: { user: true, merchant: true, operationWinner: true, userWinner: true, admin: true },
    });
    // query with main condition: Merchant Manager and Payment Method Id
    query.where(
      'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
      {
        merchantId,
      }
    );
    query.where('order.payment_method_id = :paymentMethodId', {
      paymentMethodId,
    });
    if (status.length > 0) {
      query.andWhere('order.status IN (:status)').setParameters({ status });
    }
    return query.getCount();
  }

  public getPendingOrderByUserId(userId: string) {
    return this.buildQuery()
      .where('order.userId = :userId and order.status <> :completed and order.status <> :cancelled')
      .setParameters({ userId, completed: OrderStatus.COMPLETED, cancelled: OrderStatus.CANCELLED })
      .getOne();
  }

  public getPendingOrderByOperation(operationId: string, type: OperationType) {
    const queryBuilder = this.createQueryBuilder('order');
    if (type === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.andWhere('order.merchantId = :operationId', { operationId });
    }
    if (type === OperationType.MERCHANT_SUPPORTER) {
      queryBuilder.andWhere('order.supporterId = :operationId', { operationId });
    }
    if (type === OperationType.MERCHANT_MANAGER) {
      queryBuilder.andWhere(
        `order.merchantId IN (select operation.id from operations operation
        WHERE operation.merchant_manager_id = :operationId)`,
        { operationId }
      );
    }
    queryBuilder.andWhere('(order.status <> :completed AND order.status <> :cancelled)', {
      completed: OrderStatus.COMPLETED,
      cancelled: OrderStatus.CANCELLED,
    });
    return queryBuilder.getOne();
  }

  public getCountdownOrderList(steps: Steps[], type: TradeType = TradeType.BUY) {
    return (
      this.createQueryBuilder('order')
        // .where('order.endedTime > NOW()')
        .where('(order.type = :type)')
        .andWhere('(order.status = :toBePaid OR order.status = :confirmPaid OR order.status = :paid)')
        .andWhere('step IN(:...steps)', {
          steps,
        })
        .setParameters({
          toBePaid: OrderStatus.TO_BE_PAID,
          confirmPaid: OrderStatus.CONFIRM_PAID,
          paid: OrderStatus.PAID,
          type,
        })
        .getMany()
    );
  }

  public async getUserOrderStatistic(userId: string) {
    return this.createQueryBuilder('order')
      .leftJoin(Appeal, 'appeal', 'appeal.id = order.appeal_id')
      .select(`SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN order.amount ELSE 0 END) as total_amount`)
      .addSelect(
        `SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN order.total_price ELSE 0 END) as total_price`
      )
      .addSelect(`SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN 1 ELSE 0 END) as total_order_completed`)
      .addSelect('order.asset_id as asset_id')
      .addSelect('COUNT(order.id) as total_order')
      .andWhere(
        '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal_id IS NOT NULL AND appeal.decision_result != :decisionResult))',
        {
          completeOrderStatus: OrderStatus.COMPLETED,
          cancelOrderStatus: OrderStatus.CANCELLED,
          decisionResult: BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED,
        }
      )
      .andWhere('order.userId = :userId', { userId })
      .groupBy('order.asset_id')
      .getRawMany();
  }

  public async getAndCountOrders<
    Q extends QueryOrderData & {
      merchantType?: UserType | OperationType;
    }
  >(queryData: Q): Promise<[Order[], number]> {
    const {
      limit,
      page,
      merchantId,
      merchantType,
      userId,
      tradeType,
      assetType,
      orderField = 'updatedAt',
      orderDirection,
      status,
      step,
      startDate,
      endDate,
      postId,
      amount,
      totalPrice,
      hasAppeal,
      canceledByAdmin,
      readonly,
      appealStatus,
      sort,
      orderGroupStep,
      hasHistoriesOrder,
      supporterId,
      adminSupporterId,
      searchField,
      searchValue,
    } = queryData;
    const queryBuilder = this.buildQuery({
      withDeleted: { merchant: true },
    }).addSelect('TRUNCATE(order.totalPrice, 0)', 'amount');
    if (tradeType) {
      queryBuilder.andWhere('order.type = :tradeType', {
        tradeType,
      });
    }
    if (assetType) {
      queryBuilder.andWhere('order.asset_id = :assetType', {
        assetType,
      });
    }
    if (status.length && !hasHistoriesOrder) {
      queryBuilder.andWhere('order.status IN(:...status)', {
        status,
      });
    }
    if (hasHistoriesOrder) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(`order.status = :status AND order.appealId IS NOT NULL`, {
            status: OrderStatus.CANCELLED,
          }).orWhere(`order.status = :orderStatus`, {
            orderStatus: OrderStatus.COMPLETED,
          });
        })
      );
    }
    if (step.length) {
      queryBuilder.andWhere('order.step IN(:...step)', {
        step,
      });
    }
    if (merchantId) {
      if (merchantType && merchantType === OperationType.MERCHANT_MANAGER) {
        queryBuilder.andWhere(
          `order.merchantId IN (select operation.id from operations operation \
            WHERE operation.merchant_manager_id = :merchantId \
            AND (operation.status IN(:...userStatus) OR operation.deletedAt IS NOT NULL))`,
          {
            merchantId,
            userStatus: [UserStatus.INACTIVE, UserStatus.BLOCKED],
          }
        );
      }
      if (merchantType && merchantType === OperationType.MERCHANT_OPERATOR) {
        queryBuilder.andWhere('order.merchantId = :merchantId', {
          merchantId,
        });
      }
      if (merchantType && merchantType === OperationType.MERCHANT_SUPPORTER) {
        if (readonly) {
          queryBuilder.andWhere(
            `order.appeal IS NOT NULL AND order.supporterId IS NULL \
            AND order.merchantId IN (select operation.id from operations operation \
            where operation.merchant_manager_id = (select supporter.merchant_manager_id from operations supporter where supporter.id = :merchantId LIMIT 1))`,
            { merchantId }
          );
        } else {
          queryBuilder.andWhere('order.supporterId = :merchantId', {
            merchantId,
          });
        }
      }
    }
    if (postId) {
      queryBuilder.andWhere('order.postId = :postId', {
        postId,
      });
    }
    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', {
        userId,
      });
    }
    if (supporterId) {
      queryBuilder.andWhere('order.supporterId = :supporterId', {
        supporterId,
      });
    }
    if (searchField && searchValue) {
      const query = {
        refId: 'order.refId = :search',
        totalPrice: '(TRUNCATE(order.totalPrice, 0) <= TRUNCATE(:search, 0))',
        transCode: 'order.transCode = :search COLLATE utf8mb4_bin',
      };
      queryBuilder.andWhere(query[searchField] || query['refId'], {
        search: `${searchValue}`,
      });
    }
    if (totalPrice) {
      queryBuilder.andWhere('TRUNCATE(order.totalPrice, 0) <= TRUNCATE(:totalPrice, 0)', {
        totalPrice,
      });
    }
    if (!isUndefined(hasAppeal)) {
      queryBuilder.andWhere(`order.appealId IS ${hasAppeal ? 'NOT' : ''} NULL`);
    }
    if (!isUndefined(canceledByAdmin) && !adminSupporterId && canceledByAdmin) {
      queryBuilder.andWhere(`appeal.adminId IS NOT NULL`);
    }

    if (adminSupporterId) {
      if (readonly) {
        queryBuilder.andWhere(`appeal.adminId IS NULL`);
      } else {
        queryBuilder.andWhere(`appeal.adminId = :adminSupporterId`, {
          adminSupporterId,
        });
      }
    }

    if (appealStatus.length) {
      queryBuilder.andWhere('appeal.status IN(:...appealStatus)', {
        appealStatus,
      });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    if (amount && amount > 0) {
      queryBuilder.andWhere('order.amount <= :amount', { amount });
    }

    if (orderGroupStep) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('order.type = :buyType AND order.step IN(:...buySteps)', {
            buyType: TradeType.BUY,
            buySteps: orderGroupStep[TradeType.BUY],
          }).orWhere('order.type = :sellType AND order.step IN(:...sellSteps)', {
            sellType: TradeType.SELL,
            sellSteps: orderGroupStep[TradeType.SELL],
          });
        })
      );
    }

    if (orderField && orderDirection) {
      sort[orderField] = orderDirection;
    }
    if (sort?.length) {
      this.buildSorting(queryBuilder, sort);
    } else {
      this.buildDefaultOrderSorting(queryBuilder);
    }

    if (page && limit) {
      queryBuilder.skip(limit * (page - 1)).take(limit);
    }
    return queryBuilder.getManyAndCount();
  }

  public async getUserOrders(queryData: UserQueryOrder): Promise<[Order[], number]> {
    const {
      limit,
      page,
      userId,
      type,
      assetId,
      orderField = 'updatedAt',
      orderDirection,
      status,
      startDate,
      endDate,
      searchField,
      searchValue,
      sort,
      hasAppeal,
    } = queryData;
    const queryBuilder = this.buildQuery({
      withDeleted: { merchant: true },
    })
      .addSelect('TRUNCATE(order.totalPrice, 0)', 'amount')
      .where('order.userId = :userId', {
        userId,
      });

    if (status.length) {
      queryBuilder.andWhere('order.status IN(:...status)', {
        status,
      });
    }

    if (hasAppeal) {
      queryBuilder.andWhere('order.appealId IS NOT NULL');
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    if (type) {
      queryBuilder.andWhere('order.type = :type', {
        type,
      });
    }
    if (assetId) {
      queryBuilder.andWhere('order.asset_id = :assetId', {
        assetId,
      });
    }
    if (searchField && searchValue) {
      const query = {
        refId: 'order.refId = :search',
        totalPrice: '(TRUNCATE(order.totalPrice, 0) <= TRUNCATE(:search, 0))',
        transCode: 'order.transCode = :search COLLATE utf8mb4_bin',
      };
      queryBuilder.andWhere(query[searchField] || query['refId'], {
        search: `${searchValue}`,
      });
    }

    if (orderField && orderDirection) {
      sort[orderField] = orderDirection;
    }
    if (sort?.length) {
      this.buildSorting(queryBuilder, sort);
    } else {
      this.buildDefaultOrderSorting(queryBuilder);
    }

    if (page && limit) {
      queryBuilder.skip(limit * (page - 1)).take(limit);
    }
    return queryBuilder.getManyAndCount();
  }

  public statisticRecentOrders(options: FindOrderViaUserType) {
    return this.buildOptionsGetRecentOrders(options).execute();
  }

  public async countOrderAmountTotalByShift(operationId: string, checkIn: Date, checkOut: Date) {
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoin(Appeal, 'appeal', 'appeal.id = order.appeal_id')
      .select('SUM(order.total_price)', 'totalPrice')
      .andWhere('order.merchant_id = :operationId', { operationId })
      .andWhere('order.completedTime BETWEEN :checkIn AND :checkOut', { checkIn, checkOut })
      .andWhere(
        '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal_id IS NOT NULL AND appeal.decision_result != 5))',
        {
          completeOrderStatus: OrderStatus.COMPLETED,
          cancelOrderStatus: OrderStatus.CANCELLED,
        }
      );
    return queryBuilder.getRawOne();
  }

  public async getDataExportOrderHistory(filter: ExportReportRequest, currentUser: Operation | User) {
    const queryBuilder = this.createQueryBuilder('order')
      .withDeleted()
      .innerJoinAndSelect('order.post', 'post')
      .innerJoinAndSelect('order.fiat', 'fiat')
      .innerJoinAndSelect('order.asset', 'asset')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.merchant', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
      .leftJoinAndSelect('order.appeal', 'appeal')
      .andWhere('order.completed_time BETWEEN :from AND :to', { from: filter.startDate, to: filter.endDate })
      .andWhere(
        '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal_id IS NOT NULL AND appeal.decision_result != 5))',
        {
          completeOrderStatus: OrderStatus.COMPLETED,
          cancelOrderStatus: OrderStatus.CANCELLED,
        }
      )
      .addSelect(
        '(SELECT ct.hash FROM crypto_transactions ct WHERE ct.order_id = order.id ORDER BY created_at DESC LIMIT 1)',
        'txid'
      )
      .orderBy('order.completed_time', 'DESC');
    if (filter.assetIds?.length) {
      queryBuilder.andWhere('order.asset_id IN (:...assetIds)', { assetIds: filter.assetIds });
    }
    if (filter.tradeType) {
      queryBuilder.andWhere('order.type = :type', { type: filter.tradeType });
    }
    if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      queryBuilder.andWhere('merchantManager.id = :merchantManagerId', { merchantManagerId: currentUser.id });
    } else if (currentUser.type === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.andWhere('order.merchant_id = :merchantId', { merchantId: currentUser.id });
    } else if (currentUser.type === UserType.USER) {
      queryBuilder.andWhere('order.user_id = :userId', { userId: currentUser.id });
    } else if (currentUser.type === OperationType.SUPER_ADMIN) {
      if (filter.managerIds?.length) {
        queryBuilder.andWhere('merchantManager.id IN (:...managerIds)', { managerIds: filter.managerIds });
      }
    }
    return await queryBuilder.stream();
  }

  public calculateRevenueByAsset(filter: ExportReportRequest, currentUser: Operation | User) {
    let queryBuilder = this.createQueryBuilder('order')
      .withDeleted()
      .innerJoin('assets', 'as', 'as.id = order.asset_id')
      .innerJoin('operations', 'op', 'op.id = order.merchant_id')
      .leftJoin(
        (qb) =>
          qb
            .from(Order, 'od')
            .select(`SUM(od.total_penalty_fee) as total_penalty_fee`)
            .addSelect(`od.asset_id as asset_id`)
            .andWhere('od.completed_time BETWEEN :from AND :to', { from: filter.startDate, to: filter.endDate })
            .groupBy('od.asset_id'),
        'order_fee',
        'order_fee.asset_id = order.asset_id'
      )
      .leftJoin(Appeal, 'appeal', 'appeal.id = order.appeal_id')
      .select(
        `SUM(CASE WHEN order.type = '${reverseTradeType(
          TradeType.BUY,
          currentUser.type
        )}' THEN 1 ELSE 0 END) as total_buy`
      )
      .addSelect(
        `SUM(CASE WHEN order.type = '${reverseTradeType(
          TradeType.SELL,
          currentUser.type
        )}' THEN 1 ELSE 0 END) as total_sell`
      )
      .addSelect(
        `SUM(CASE WHEN order.type = '${reverseTradeType(
          TradeType.BUY,
          currentUser.type
        )}' THEN order.total_price ELSE 0 END) as total_price_buy`
      )
      .addSelect(
        `SUM(CASE WHEN order.type = '${reverseTradeType(
          TradeType.SELL,
          currentUser.type
        )}' THEN order.total_price ELSE 0 END) as total_price_sell`
      )
      .addSelect(
        `SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN order.total_price ELSE 0 END) as total_price`
      )
      .addSelect(
        `SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN order.total_fee ELSE 0 END) as total_fee`
      )
      .addSelect(`COUNT(order.id) as total_order`)
      .addSelect(`order_fee.total_penalty_fee as total_penalty_fee`)
      .addSelect(`MIN(as.name) as assets_name`)
      .addSelect(`MIN(as.network) as assets_network`)
      .where(
        '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal_id IS NOT NULL AND appeal.decision_result != 5))',
        {
          completeOrderStatus: OrderStatus.COMPLETED,
          cancelOrderStatus: OrderStatus.CANCELLED,
        }
      )
      .andWhere('order.completed_time BETWEEN :from AND :to', { from: filter.startDate, to: filter.endDate })
      .groupBy('order.asset_id');
    if (filter.assetIds?.length) {
      queryBuilder.andWhere('order.asset_id IN (:...assetIds)', { assetIds: filter.assetIds });
    }
    if (filter.tradeType) {
      queryBuilder.andWhere('order.type = :type', { type: filter.tradeType });
    }
    queryBuilder = this.buildQueryByPermission(filter, queryBuilder, currentUser);
    return queryBuilder.stream();
  }

  public calculateRevenueByAllAsset(filter: ExportReportRequest, currentUser: Operation | User, isGroup?: boolean) {
    let queryBuilder = this.createQueryBuilder('order')
      .withDeleted()
      .innerJoin('operations', 'op', 'op.id = order.merchant_id')
      .select(`SUM(order.total_price) as total_amount`)
      .where('order.status = :status', { status: OrderStatus.COMPLETED });
    if (filter.assetIds?.length) {
      queryBuilder.andWhere('order.asset_id IN (:...assetIds)', { assetIds: filter.assetIds });
    }
    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere('order.completed_time BETWEEN :from AND :to', {
        from: filter.startDate,
        to: filter.endDate,
      });
    }
    if (filter.tradeType) {
      queryBuilder.andWhere('order.type = :type', { type: filter.tradeType });
    }
    queryBuilder = this.buildQueryByPermission(filter, queryBuilder, currentUser);
    if (isGroup) {
      queryBuilder.addSelect(`order.asset_id as asset_id`).groupBy('order.asset_id');
      return queryBuilder.getRawMany();
    }
    return queryBuilder.getRawOne();
  }

  public ordersByUserIdGroupByCompleteTime(
    userId: string,
    userType: UserType | OperationType,
    dateRange: { startDate; endDate }
  ) {
    const query = this.buildOptionsGetValidOrders(false)
      .andWhere('order.completed_time BETWEEN :startDate AND :endDate', dateRange)
      .select('SUM(CASE WHEN order.status = 4 THEN order.total_price ELSE 0 END)', 'totalAmount')
      .addSelect('DATE(order.completed_time)', 'createTime')
      .addSelect('SUM(order.total_fee)', 'totalFee')
      .addSelect('SUM(order.total_penalty_fee)', 'totalPenaltyFee')
      .addSelect("SUM(CASE WHEN order.type = 'BUY' THEN 1 ELSE 0 END)", 'totalBuyOrder')
      .addSelect("SUM(CASE WHEN order.type = 'SELL' THEN 1 ELSE 0 END)", 'totalSellOrder')
      .addSelect('SUM(CASE WHEN order.status = 4 THEN 1 ELSE 0 END)', 'totalSuccessOrder')
      .addSelect(
        `SUM(CASE WHEN order.status = 5 AND order.appeal_id IS NOT NULL THEN 1 ELSE 0 END)`,
        'totalOrderCancelled'
      )
      .addSelect(
        `SUM(CASE WHEN order.appeal_id IS NOT NULL AND appeal.admin_id IS NOT NULL THEN 1 ELSE 0 END)`,
        'totalOrderAppeal'
      )
      .groupBy('DATE(order.completed_time)');
    if (userType && userId) {
      switch (userType) {
        case UserType.USER:
          query.andWhere('order.userId = :userId', { userId });
          break;
        case OperationType.MERCHANT_OPERATOR:
          query
            .addSelect(
              'SUM(CASE WHEN order.status = 4 THEN TIMESTAMPDIFF(SECOND, order.created_time, order.completed_time) ELSE 0 END)',
              'totalLifecycleCompletedTime'
            )
            .addSelect(
              'SUM(CASE WHEN order.status = 5 AND order.appeal_id IS NOT NULL THEN TIMESTAMPDIFF(SECOND, order.created_time, order.completed_time) ELSE 0 END)',
              'totalLifecycleCancelledTime'
            )
            .andWhere('order.merchantId = :userId', { userId });
          break;
        case OperationType.MERCHANT_MANAGER:
          query.andWhere(
            'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :userId)',
            { userId }
          );
          break;
        default:
          // Do nothing
          break;
      }
    }
    return query.getRawMany();
  }

  public getStatisticByDate(
    currentUser: Operation | User,
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<orderSumData> {
    const { startDate, endDate } = dateRange;
    const query = this.buildOptionsGetValidOrders(false)
      .select('SUM(CASE WHEN order.status = 4 THEN order.total_price ELSE 0 END)', 'totalAmount')
      .addSelect('SUM(order.total_fee)', 'totalFee')
      .addSelect('SUM(order.total_penalty_fee)', 'totalPenaltyFee')
      .addSelect("SUM(CASE WHEN order.type = 'BUY' THEN 1 ELSE 0 END)", 'totalBuyOrder')
      .addSelect("SUM(CASE WHEN order.type = 'SELL' THEN 1 ELSE 0 END)", 'totalSellOrder')
      .addSelect('SUM(CASE WHEN order.status = 4 THEN 1 ELSE 0 END)', 'totalSuccessOrder')
      .addSelect(
        `SUM(CASE WHEN order.status = 5 AND order.appeal_id IS NOT NULL THEN 1 ELSE 0 END)`,
        'totalOrderCancelled'
      )
      .addSelect(
        `SUM(CASE WHEN order.appeal_id IS NOT NULL AND appeal.admin_id IS NOT NULL THEN 1 ELSE 0 END)`,
        'totalOrderAppeal'
      )
      .andWhere('order.completed_time BETWEEN :startDate AND :endDate', { startDate, endDate });
    switch (currentUser.type) {
      case UserType.USER:
        query.andWhere('order.userId = :userId', { userId: currentUser.id });
        break;
      case OperationType.MERCHANT_OPERATOR:
        query.andWhere('order.merchantId = :merchantId', { merchantId: currentUser.id });
        break;
      case OperationType.MERCHANT_MANAGER:
        query.andWhere(
          'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :managerId)',
          { managerId: currentUser.id }
        );
        break;
      default:
        // Do nothing
        break;
    }
    return query.getRawOne();
  }

  public tradeTypeDifferenceReportByAsset(filter: ExportReportRequest, currentUser: Operation | User) {
    let queryBuilder = this.createQueryBuilder('order')
      .withDeleted()
      .innerJoin('assets', 'as', 'as.id = order.asset_id')
      .innerJoin('operations', 'op', 'op.id = order.merchant_id')
      .leftJoin(Appeal, 'appeal', 'appeal.id = order.appeal_id')
      .select(`COUNT(order.id) as total_order`)
      .addSelect(
        `SUM(CASE WHEN order.status = ${OrderStatus.COMPLETED} THEN order.total_price ELSE 0 END) as total_price`
      )
      .addSelect(`SUM(CASE WHEN order.status = ${OrderStatus.COMPLETED} THEN order.amount ELSE 0 END) as total_amount`)
      .addSelect(`MIN(as.name) as assets_name`)
      .addSelect(`MIN(as.network) as assets_network`)
      .addSelect(`CONCAT(order.asset_id, '|', order.type) as assets_id_type`)
      .where(
        '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal_id IS NOT NULL AND appeal.decision_result != 5))',
        {
          completeOrderStatus: OrderStatus.COMPLETED,
          cancelOrderStatus: OrderStatus.CANCELLED,
        }
      )
      .groupBy('assets_id_type');
    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere('order.completed_time BETWEEN :from AND :to', {
        from: filter.startDate,
        to: filter.endDate,
      });
    }
    if (filter.tradeType) {
      queryBuilder.andWhere('order.type = :type', { type: filter.tradeType });
    }
    queryBuilder = this.buildQueryByPermission(filter, queryBuilder, currentUser);
    return queryBuilder.stream();
  }

  public getOrdersInBlackList(type: TradeType, steps: number[]) {
    return this.createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoin(BlacklistEntity, 'blacklist', 'blacklist.walletAddress = user.walletAddress')
      .where('order.type = :type', { type })
      .andWhere('order.status IN(:...statuses)', {
        statuses: [OrderStatus.TO_BE_PAID, OrderStatus.PAID, OrderStatus.CONFIRM_PAID],
      })
      .andWhere('order.step IN(:...steps)', { steps })
      .getMany();
  }

  public async getTradingVolumeByPeriod(day: string): Promise<{ completedGroupHour: string; totalPrice: number }[]> {
    const startDate = moment(
      `${moment(day, 'YYYY-MM-DD HH:mm:ss').startOf('day').format('YYYY-MM-DDTHH:mm:ss')}${env.app.timeZone}`
    )
      .utc()
      .toDate();
    const endDate = moment(
      `${moment(day, 'YYYY-MM-DD HH:mm:ss').endOf('day').format('YYYY-MM-DDTHH:mm:ss')}${env.app.timeZone}`
    )
      .utc()
      .toDate();
    const queryBuilder = this.createQueryBuilder('order')
      .withDeleted()
      .select(
        `CONCAT(FLOOR(HOUR(CONVERT_TZ(order.completedTime, '+00:00','${env.app.timeZone}')) / 4) * 4, '-', (FLOOR(HOUR(CONVERT_TZ(order.completedTime, '+00:00','${env.app.timeZone}')) / 4) + 1) * 4, 'h')`,
        'completedGroupHour'
      )
      .addSelect('SUM(order.totalPrice)', 'totalPrice')
      .innerJoin(Operation, 'merchant', 'merchant.id = order.merchantId')
      .where('order.completedTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('completedGroupHour');
    return queryBuilder.getRawMany();
  }

  public async getOrderPriceStatisticByPeriod(
    from: string,
    to: string,
    type: TradeType,
    managerId: string
  ): Promise<Order[]> {
    const queryBuilder = this.createQueryBuilder('order')
      .select('order.refId', 'refId')
      .addSelect('order.benchmarkPriceAtCreated', 'benchmarkPriceAtCreated')
      .addSelect('order.benchmarkPriceAtSent', 'benchmarkPriceAtSent')
      .addSelect('order.price', 'price')
      .where('order.completedTime BETWEEN :from AND :to', {
        from,
        to,
      })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.type = :type', { type })
      .andWhere(
        'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :managerId)',
        { managerId }
      )
      .orderBy('order.completedTime', 'ASC');
    return queryBuilder.getRawMany();
  }

  // tslint:disable-next-line:max-line-length
  public async getRevenueAndPriceByPeriod(
    revenueAndPriceByPeriodRequest: RevenueAndPriceByPeriodRequest
  ): Promise<{ priceAvg: number; totalFee: number; totalPenaltyFee: number; date: string }[]> {
    const { from, to, groupType, tradeType } = revenueAndPriceByPeriodRequest;
    const queryBuilder = this.createQueryBuilder('order')
      .select('AVG(order.price)', 'priceAvg')
      .addSelect(`SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN order.totalFee ELSE 0 END)`, 'totalFee')
      .addSelect('SUM(order.totalPenaltyFee)', 'totalPenaltyFee')
      .where('order.completedTime BETWEEN :startDate AND :endDate', {
        startDate: moment(from).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment(to).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      })
      .groupBy('date')
      .orderBy('date', 'ASC');
    if (tradeType) {
      queryBuilder.andWhere('order.type = :tradeType', { tradeType });
    }
    switch (groupType) {
      case GroupTypeRevenue.DAY:
        queryBuilder.addSelect(
          `DATE_FORMAT(CONVERT_TZ(order.completedTime, '+00:00', '${env.app.timeZone}'), '%Y-%m-%d')`,
          'date'
        );
        break;
      case GroupTypeRevenue.MONTH:
        queryBuilder.addSelect(
          `DATE_FORMAT(CONVERT_TZ(order.completedTime, '+00:00', '${env.app.timeZone}'), "%Y-%m")`,
          'date'
        );
        break;
      case GroupTypeRevenue.YEAR:
        queryBuilder.addSelect(
          `DATE_FORMAT(CONVERT_TZ(order.completedTime, '+00:00', '${env.app.timeZone}'), "%Y")`,
          'date'
        );
        break;
      default: {
        queryBuilder.addSelect(
          `DATE_FORMAT(CONVERT_TZ(order.completedTime, '+00:00','${env.app.timeZone}'), '%Y-%m-%d')`,
          'date'
        );
        break;
      }
    }
    return queryBuilder.getRawMany();
  }

  public async getMatchedOrdersByPost(request: { limit: number; page: number; postRefId: string }) {
    const { limit, page, postRefId } = request;
    const queryBuilder = this.buildQuery({ withDeleted: { merchant: true } }).where('post.ref_id = :postRefId', {
      postRefId,
    });
    if (page && limit) {
      queryBuilder.skip(limit * (page - 1)).take(limit);
    }
    return queryBuilder.getManyAndCount();
  }

  private buildQuery(options?: {
    withDeleted?: {
      user?: boolean;
      merchant?: boolean;
      supporter?: boolean;
      fiat?: boolean;
      asset?: boolean;
      post?: boolean;
      cryptoTransaction?: boolean;
      appeal?: boolean;
      admin?: boolean;
      operationWinner?: boolean;
      userWinner?: boolean;
      paymentMethod?: boolean;
      paymentMethodField?: boolean;
      '*'?: boolean;
    };
  }) {
    options = this.parseBuildQueryOptions(options);
    return this.createQueryBuilder('order')
      .withDeleted()
      .innerJoinAndSelect('order.user', 'user', !options?.withDeleted?.user ? `user.deletedAt IS NULL` : null)
      .leftJoinAndSelect(
        'order.supporter',
        'supporter',
        !options?.withDeleted?.merchant ? `supporter.deletedAt IS NULL` : null
      )
      .innerJoinAndSelect(
        'order.merchant',
        'merchant',
        !options?.withDeleted?.merchant ? `merchant.deletedAt IS NULL` : null
      )
      .innerJoinAndSelect(
        'merchant.merchantManager',
        'merchantManager',
        !options?.withDeleted?.merchant ? `merchantManager.deletedAt IS NULL` : null
      )
      .innerJoinAndSelect('order.fiat', 'fiat', !options?.withDeleted?.fiat ? `fiat.deletedAt IS NULL` : null)
      .innerJoinAndSelect('order.asset', 'asset', !options?.withDeleted?.asset ? `asset.deletedAt IS NULL` : null)
      .innerJoinAndSelect('order.post', 'post', !options?.withDeleted?.post ? `post.deletedAt IS NULL` : null)
      .leftJoinAndSelect(
        'order.cryptoTransactions',
        'cryptoTransaction',
        !options?.withDeleted?.cryptoTransaction ? `cryptoTransaction.deletedAt IS NULL` : null
      )
      .leftJoinAndSelect('cryptoTransaction.cryptoTransactionStatus', 'cryptoTransactionStatus')
      .leftJoinAndSelect('order.appeal', 'appeal', !options?.withDeleted?.appeal ? `appeal.deletedAt IS NULL` : null)
      .leftJoinAndSelect('appeal.admin', 'admin', !options?.withDeleted?.admin ? `admin.deletedAt IS NULL` : null)
      .leftJoinAndSelect(
        'appeal.operationWinner',
        'operationWinner',
        !options?.withDeleted?.operationWinner ? `operationWinner.deletedAt IS NULL` : null
      )
      .leftJoinAndSelect(
        'appeal.userWinner',
        'userWinner',
        !options?.withDeleted?.userWinner ? `userWinner.deletedAt IS NULL` : null
      )
      .leftJoinAndSelect(
        'order.paymentMethod',
        'paymentMethod',
        !options?.withDeleted?.paymentMethod ? `paymentMethod.deletedAt IS NULL` : null
      )
      .leftJoinAndSelect(
        'paymentMethod.paymentMethodFields',
        'paymentMethodField',
        !options?.withDeleted?.paymentMethodField ? `paymentMethodField.deletedAt IS NULL` : null
      )
      .leftJoinAndSelect('order.paymentTickets', 'paymentTickets');
  }

  private parseBuildQueryOptions(options?: {
    withDeleted?: {
      user?: boolean;
      merchant?: boolean;
      fiat?: boolean;
      asset?: boolean;
      post?: boolean;
      cryptoTransaction?: boolean;
      appeal?: boolean;
      admin?: boolean;
      operationWinner?: boolean;
      userWinner?: boolean;
      paymentMethod?: boolean;
      paymentMethodField?: boolean;
      '*'?: boolean;
    };
  }) {
    return {
      ...options,
      withDeleted: this.parseBuildQueryWithDeletedOption(options),
    };
  }

  private parseBuildQueryWithDeletedOption(options: {
    withDeleted?: {
      user?: boolean;
      merchant?: boolean;
      fiat?: boolean;
      asset?: boolean;
      post?: boolean;
      cryptoTransaction?: boolean;
      appeal?: boolean;
      admin?: boolean;
      operationWinner?: boolean;
      userWinner?: boolean;
      paymentMethod?: boolean;
      paymentMethodField?: boolean;
      '*'?: boolean;
    };
  }) {
    const wildcard = isBoolean(options?.withDeleted?.['*']) ? options?.withDeleted?.['*'] : null;
    const withDeleted = (value?: boolean) => (isBoolean(wildcard) ? wildcard : isBoolean(value) ? value : null);
    return {
      user: withDeleted(options?.withDeleted?.user),
      merchant: withDeleted(options?.withDeleted?.merchant),
      fiat: withDeleted(options?.withDeleted?.fiat),
      asset: withDeleted(options?.withDeleted?.asset),
      post: withDeleted(options?.withDeleted?.post),
      cryptoTransaction: withDeleted(options?.withDeleted?.cryptoTransaction),
      appeal: withDeleted(options?.withDeleted?.appeal),
      admin: withDeleted(options?.withDeleted?.admin),
      operationWinner: withDeleted(options?.withDeleted?.operationWinner),
      userWinner: withDeleted(options?.withDeleted?.userWinner),
      paymentMethod: withDeleted(options?.withDeleted?.paymentMethod),
      paymentMethodField: withDeleted(options?.withDeleted?.paymentMethodField),
      '*': wildcard,
    };
  }

  private buildQueryByPermission(
    filter: ExportReportRequest,
    queryBuilder: SelectQueryBuilder<Order>,
    currentUser: Operation | User
  ) {
    if (currentUser.type === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.andWhere('op.id  = :merchantId', { merchantId: currentUser.id });
    } else if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      queryBuilder.andWhere('op.merchant_manager_id = :managerId', { managerId: currentUser.id });
    } else if (currentUser.type === OperationType.SUPER_ADMIN && filter.managerIds?.length) {
      queryBuilder.andWhere('op.merchant_manager_id IN (:...managerIds)', { managerIds: filter.managerIds });
    } else if (currentUser.type === UserType.USER) {
      queryBuilder.andWhere('order.user_id = :userId', { userId: currentUser.id });
    }
    return queryBuilder;
  }

  private buildOptionsGetValidOrders(isCustomBuild: boolean = true) {
    const query = isCustomBuild
      ? this.buildQuery()
      : this.createQueryBuilder('order').leftJoinAndSelect('order.appeal', 'appeal');
    return query.where(
      '(order.status = :completeOrderStatus OR (order.status = :cancelOrderStatus AND order.appeal IS NOT NULL AND appeal.decision_result != 5))',
      { completeOrderStatus: OrderStatus.COMPLETED, cancelOrderStatus: OrderStatus.CANCELLED }
    );
  }

  private buildOptionsGetRecentOrders(options: FindOrderViaUserType) {
    const { userId, operationId, managerId, orderStatus } = options;
    const startOfToday = moment().utc().endOf('day').toDate();
    const buildQuery = this.buildOptionsGetValidOrders().andWhere(
      '(order.createdTime BETWEEN NOW() - INTERVAL :numberMonthlyDays DAY AND :startOfToday)',
      { numberMonthlyDays: MONTHLY_DAYS_NUMBER, startOfToday }
    );
    if (orderStatus) {
      if (Array.isArray(orderStatus)) {
        buildQuery.andWhere('order.status IN (:...orderStatus)', { orderStatus });
      } else {
        buildQuery.andWhere('order.status = :orderStatus', { orderStatus });
      }
    }
    if (userId) {
      buildQuery.andWhere('order.userId = :userId', { userId });
    }
    if (operationId) {
      buildQuery.andWhere('order.merchantId = :userId', { userId });
    }
    if (managerId) {
      buildQuery.andWhere(
        'order.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :userId)',
        { userId }
      );
    }
    buildQuery
      .select('SUM(order.total_fee)', 'totalFee')
      .addSelect('SUM(order.total_penalty_fee)', 'totalPenaltyFee')
      .addSelect('SUM(order.amount)', 'totalAmount')
      .addSelect("SUM(CASE WHEN order.type = 'BUY' AND order.status != 5 THEN 1 ELSE 0 END)", 'totalBuyOrder')
      .addSelect(
        "SUM(CASE WHEN order.type = 'BUY' AND order.status = 5 AND order.appeal_id IS NOT NULL THEN 1 ELSE 0 END)",
        'totalAppealBuyOrder'
      )
      .addSelect("SUM(CASE WHEN order.type = 'SELL' AND order.status != 5 THEN 1 ELSE 0 END)", 'totalSellOrder')
      .addSelect(
        "SUM(CASE WHEN order.type = 'SELL' AND order.status = 5 AND order.appeal_id IS NOT NULL THEN 1 ELSE 0 END)",
        'totalAppealSellOrder'
      )
      .addSelect('SUM(CASE WHEN order.status = 4 THEN 1 ELSE 0 END)', 'totalSuccessOrder');
    return buildQuery;
  }

  public async getCompletedSellOrdersFromTimeRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.post', 'post')
      .leftJoinAndSelect('order.asset', 'asset')
      .leftJoinAndSelect('order.merchant', 'merchant')
      .leftJoinAndSelect('order.cryptoTransactions', 'cryptoTransactions')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodFields')
      .leftJoinAndSelect('order.paymentTickets', 'paymentTickets')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.type = :type', { type: TradeType.SELL });

    if (startDate) {
      qb.andWhere('DATE(order.createdAt) >= DATE(:startDate)', { startDate });
    }

    if (endDate) {
      qb.andWhere('DATE(order.createdAt) <= DATE(:endDate)', { endDate });
    }

    qb.orderBy('order.createdAt', 'ASC');

    return qb.getMany();
  }

  public async getUnPublishedCompletedOrdersFromTimeRange(
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<Order[]> {
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.post', 'post')
      .leftJoinAndSelect('order.asset', 'asset')
      .leftJoinAndSelect('order.merchant', 'merchant')
      .leftJoinAndSelect('order.cryptoTransactions', 'cryptoTransactions')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodFields')
      .leftJoinAndSelect('order.paymentTickets', 'paymentTickets')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('NOT EXISTS (SELECT 1 FROM outbox WHERE outbox.aggregate_id = order.refId)');

    if (startDate) {
      qb.andWhere('DATE(order.createdAt) >= DATE(:startDate)', { startDate });
    }

    if (endDate) {
      qb.andWhere('DATE(order.createdAt) <= DATE(:endDate)', { endDate });
    }

    if (limit) {
      qb.limit(limit);
    }

    qb.orderBy('order.createdAt', 'ASC');

    return qb.getMany();
  }
}
