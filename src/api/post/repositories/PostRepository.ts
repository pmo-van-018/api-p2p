import { EntityRepository, SelectQueryBuilder } from 'typeorm';

import { Appeal } from '@api/appeal/models/Appeal';
import { OperationStatus, OperationType, PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { Order, OrderStatus } from '@api/order/models/Order';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { Post } from '@api/post/models/Post';
import {
  FindAllPost,
  FindAllPostByMultiStatus,
  FindMerchantPost,
  ManagerPostSearchData,
  QueryPostData,
  QueryPublicViewPosts,
  SearchPost,
} from '@api/post/types/Post';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { env } from '@base/env';
import { SqlUtil } from '@base/utils/sql.util';
import moment from 'moment';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { GetAmountRangeRequest } from '@api/post/requests/GetAmountRangeRequest';

/**
 * To optimize API latency and user experience, we only allow the client
 * to query the first n items.
 * Default: 1000.
 */
const MAX_POST_CAN_FETCH = env.cache.maxSearchPost;

@EntityRepository(Post)
export class PostRepository extends BaseRepository<Post> {
  public async searchOnlinePost(searchPostType: SearchPost) {
    const { assetId, fiatId, merchantIds, type, limit, page, amount, minAmount, maxAmount, sortDirection } =
      searchPostType;

    const canSearch = limit * page <= MAX_POST_CAN_FETCH;
    if (!canSearch) {
      return [[], 0];
    }

    const queryBuilder = this.createQueryBuilder('post').innerJoin('post.merchant', 'merchant');

    // NOTE: currently, we use composite index: assetId -> status -> type -> isShow -> fiatId -> readlPrice.
    // So we should query by order it.
    if (assetId) {
      queryBuilder.andWhere('post.assetId = :assetId', { assetId });
    }
    queryBuilder
      .andWhere('post.status = :status', { status: PostStatus.ONLINE })
      .andWhere('post.type = :type', { type })
      .andWhere('post.isShow = :isShow', { isShow: true });
    if (fiatId) {
      queryBuilder.andWhere('post.fiatId = :fiatId', { fiatId });
    }

    if (merchantIds?.length) {
      queryBuilder.andWhere('post.merchantId IN (:...merchantIds)', { merchantIds });
    }

    if (typeof amount === 'number' && amount >= 0) {
      queryBuilder.andWhere('post.minOrderAmount <= :minOrderAmount', { minOrderAmount: amount });
      queryBuilder.andWhere('post.maxOrderAmount >= :maxOrderAmount', { maxOrderAmount: amount });
    }
    if (minAmount > 0) {
      queryBuilder.andWhere('post.minOrderAmount >= :minAmount', { minAmount });
    }
    if (maxAmount > 0) {
      queryBuilder.andWhere('post.maxOrderAmount <= :maxAmount', { maxAmount });
    }

    const rawTotal = await this.query(
      `SELECT count(*) as total from ( ${SqlUtil.buildRawSqlFromQueryBuilder(
        queryBuilder.take(MAX_POST_CAN_FETCH)
      )} ) as totalPosts`,
      []
    );
    const total = Number(rawTotal[0]['total']);
    if (!total) {
      return [[], 0];
    }

    const rawPostIdQuery = queryBuilder.skip(limit * (page - 1)).take(limit);
    if (sortDirection) {
      rawPostIdQuery.orderBy('post.realPrice', sortDirection === 'ASC' ? 'ASC' : 'DESC');
    } else {
      rawPostIdQuery.orderBy('post.realPrice', type === TradeType.BUY ? 'DESC' : 'ASC');
    }
    const rawPostIds = await rawPostIdQuery.getMany();

    const qb = this.buildQuery();
    const rs = qb.where('post.id IN (:...ids)', { ids: rawPostIds.map((p) => p.id) });
    if (sortDirection) {
      rs.orderBy('post.realPrice', sortDirection === 'ASC' ? 'ASC' : 'DESC');
    } else {
      rs.orderBy('post.realPrice', type === TradeType.BUY ? 'DESC' : 'ASC');
    }
    const result = await rs.getMany();
    return [result, total] as any;
  }

  public async getMerchantPosts(options: {
    merchantId: string;
    merchantType: OperationType;
    postStatus?: PostStatus | PostStatus[];
  }): Promise<Post[]> {
    const { merchantId, merchantType, postStatus } = options;

    const queryBuilder = this.buildQuery(true);
    if (merchantType === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.where('post.merchantId = :merchantId', { merchantId });
    }
    if (merchantType === OperationType.MERCHANT_MANAGER) {
      queryBuilder.where(
        'post.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
        {
          merchantId,
        }
      );
    }

    if (Array.isArray(postStatus)) {
      queryBuilder.andWhere('post.status IN (:...postStatus)', { postStatus });
    } else {
      queryBuilder.andWhere('post.status = :postStatus', { postStatus });
    }

    return queryBuilder.getMany();
  }
  public countPostByMerchantAndStatus(
    merchantId: string,
    merchantType: OperationType
  ): Promise<{ status: number; total: number }[]> {
    const queryBuilder = this.buildQuery();
    if (merchantType === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.where('post.merchantId = :merchantId', { merchantId });
    }
    if (merchantType === OperationType.MERCHANT_MANAGER) {
      queryBuilder.where(
        'post.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
        {
          merchantId,
        }
      );
    }
    queryBuilder.select('post.status', 'status').addSelect('COUNT(DISTINCT(post.id))', 'total').groupBy('post.status');
    return queryBuilder.getRawMany();
  }

  public countByMerchantAndPaymentMethodId(merchantId: string, paymentMethodId: string) {
    const query = this.buildQuery();
    // query with main condition: Merchant Manager and Payment Method Id (for all status)
    query
      .where(
        'post.merchant_id IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
        {
          merchantId,
        }
      )
      .andWhere('post.payment_method_id = :paymentMethodId', {
        paymentMethodId,
      });

    return query.getCount();
  }

  public getBuyOnlineInfo(id: string) {
    return this.buildQuery()
      .where('post.id = :id')
      .andWhere('post.status = :status')
      .andWhere('post.type = :type')
      .setParameters({ id, status: PostStatus.ONLINE, type: TradeType.BUY })
      .getOneOrFail();
  }

  public getAndCountPosts(queryData: QueryPostData): Promise<[Post[], number]> {
    const {
      limit,
      page,
      postType,
      type,
      merchantId,
      orderField = 'createdAt',
      orderDirection,
      status,
      assetId,
      search,
      startDate,
      endDate,
    } = queryData;
    const queryBuilder = this.buildQuery().addSelect('TRUNCATE(post.availableAmount, 0)', 'amount');

    // TODO: remove after refactor post module
    if (postType) {
      queryBuilder.andWhere('post.type = :type', {
        type: postType,
      });
    }
    if (type) {
      queryBuilder.andWhere('post.type = :type', {
        type,
      });
    }
    if (status.length) {
      queryBuilder.andWhere('post.status IN (:status)', {
        status,
      });
    }
    if (assetId) {
      queryBuilder.andWhere('post.asset_id = :assetId', {
        assetId,
      });
    }
    if (merchantId) {
      queryBuilder.andWhere('post.merchantId = :merchantId', {
        merchantId,
      });
    }

    if (search) {
      queryBuilder.andWhere('TRUNCATE(post.availableAmount, 0) = TRUNCATE(:search, 0) OR post.id = :search', {
        search: `${search}`,
      });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('post.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    this.buildSortingGetAndCountPosts(queryBuilder, { orderField, orderDirection });
    queryBuilder.skip(limit * (page - 1)).take(limit);
    return queryBuilder.getManyAndCount();
  }

  public async getPostsByOperationsOfManager(queryData: ManagerPostSearchData): Promise<[Post[], number]> {
    const {
      limit,
      page,
      type,
      managerId,
      orderField = 'createdAt',
      orderDirection = 'DESC',
      status,
      assetId,
      search,
      searchType,
    } = queryData;
    const queryBuilder = this.buildQuery().addSelect('TRUNCATE(post.availableAmount, 0)', 'amount');

    queryBuilder.andWhere('merchant.status = :merchantStatus', {
      merchantStatus: OperationStatus.ACTIVE,
    });

    if (type) {
      queryBuilder.andWhere('post.type = :type', {
        type,
      });
    }

    if (status.length) {
      queryBuilder.andWhere('post.status IN (:status)', {
        status,
      });
    }

    if (assetId) {
      queryBuilder.andWhere('post.asset_id = :assetId', {
        assetId,
      });
    }

    if (managerId) {
      queryBuilder.andWhere('merchantManager.id = :managerId', { managerId });
    }

    if (search && searchType) {
      switch (searchType) {
        case 'WALLET_ADDRESS':
          queryBuilder.andWhere('merchant.walletAddress LIKE :search', {
            search,
          });
          break;
        case 'NICK_NAME':
          queryBuilder.andWhere('LOWER(merchant.nickName) LIKE LOWER(:search)', {
            search: `%${search}%`,
          });
          break;
        case 'POST_REFID':
          queryBuilder.andWhere('post.refId LIKE :search', {
            search,
          });
          break;
        default:
          break;
      }
    }

    this.buildSortingGetAndCountPostsForMananger(queryBuilder, { orderField, orderDirection });
    queryBuilder.skip(limit * (page - 1)).take(limit);
    return queryBuilder.getManyAndCount();
  }

  /**
   * Retrieve the maximum value of the "max_order_amount" field of posts with some parameters
   * @param {PostSearchOptionsType} searchPostOptionType The request parameters
   * @returns {{ maxAmount: number }}
   */
  public getAmountRange(getAmountRangeRequest: GetAmountRangeRequest) {
    const { type, assetName, assetNetwork, fiat } = getAmountRangeRequest;

    const queryBuilder = this.createQueryBuilder('post')
      .innerJoinAndSelect('post.asset', 'asset')
      .innerJoinAndSelect('post.fiat', 'fiat')
      .where('post.status = :status')
      .andWhere('post.type = :type')
      .andWhere('asset.name = :assetName')
      .andWhere('asset.network = :assetNetwork')
      .andWhere('fiat.name = :fiat');

    queryBuilder
      .select('MAX(post.max_order_amount)', 'maxAmount')
      .addSelect('MIN(post.min_order_amount)', 'minAmount')
      .setParameters({ type, assetName, assetNetwork, fiat, status: PostStatus.ONLINE });

    return queryBuilder.getRawOne();
  }

  public getPublicViewPosts(queryPublicViewPosts: QueryPublicViewPosts): Promise<[Post[], number]> {
    const { limit, offset, postType } = queryPublicViewPosts;
    const queryBuilder = this.buildQuery().addSelect('TRUNCATE(post.availableAmount, 0)', 'amount');
    if (postType) {
      queryBuilder.andWhere('post.type = :type', {
        type: postType,
      });
    }
    queryBuilder.addOrderBy('post.realPrice', postType === TradeType.BUY ? 'DESC' : 'ASC');
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);
    return queryBuilder.getManyAndCount();
  }

  public countAllPostsByOptions(options: FindAllPost) {
    return this.buildOptionsGetAllPosts(options).getCount();
  }

  public getAllPostsByOptions(options: FindAllPost) {
    return this.buildOptionsGetAllPosts(options)
      .leftJoinAndSelect('post.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodFields')
      .getMany();
  }

  public getAllPostWithAsset(options: FindAllPost) {
    return this.buildOptionsGetAllPosts(options).getMany();
  }

  public countAllPostsByMerchantOperator(options: FindAllPost) {
    return this.buildOptionsGetAllPosts(options)
      .select([
        'group_concat(post.id) as postIds',
        'post.merchant_id as merchantId',
        'COUNT(post.merchant_id) as total',
      ])
      .groupBy('post.merchant_id')
      .getRawMany();
  }

  public countAllPostsByMultiStatus(options: FindAllPostByMultiStatus) {
    return this.buildOptionsGetAllPostsByMultiStatus(options)
      .select([
        'group_concat(post.id) as postIds',
        'post.merchant_id as merchantId',
        'COUNT(post.merchant_id) as total',
      ])
      .groupBy('post.merchant_id')
      .getRawMany();
  }

  public getOnlinePostsByPaymentMethod(paymentMethodId: string) {
    return this.createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.ONLINE })
      .andWhere('post.payment_method_id = :paymentMethodId', { paymentMethodId })
      .getMany();
  }

  public countMerchantPostByOptions(options: FindMerchantPost) {
    return this.buildOptionsGetMechantPosts(options).getCount();
  }

  public countMerchantPosts(userId: string, userType?: OperationType) {
    const query = this.createQueryBuilder('post').where('post.status = 1');
    if (userType === OperationType.MERCHANT_OPERATOR) {
      query.andWhere('post.merchantId = :userId', { userId });
    }
    if (userType === OperationType.MERCHANT_MANAGER) {
      query.andWhere(
        'post.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :userId)',
        {
          userId,
        }
      );
    }
    query
      .withDeleted()
      .select("SUM(CASE WHEN post.type = 'BUY' THEN 1 ELSE 0 END)", 'totalBuy')
      .addSelect("SUM(CASE WHEN post.type = 'SELL' THEN 1 ELSE 0 END)", 'totalSell');
    return query.getRawOne();
  }

  public async getListRecommendPrices() {
    const result = await this.createQueryBuilder('post')
      .select(`CASE WHEN post.type = 'BUY' THEN MAX(post.realPrice) ELSE MIN(post.realPrice) END as price`)
      .addSelect('post.assetId as assetId, post.type as postType')
      .addSelect('MIN(post.id) as postId')
      .where('post.status = :status', { status: PostStatus.ONLINE })
      .groupBy('post.assetId, post.type')
      .getRawMany();
    return result;
  }

  public async getPostByManagerId(managerId: string, postId: string) {
    const result = await this.createQueryBuilder('post')
      .innerJoinAndSelect('post.merchant', 'merchant')
      .innerJoinAndSelect('post.asset', 'asset')
      .where('merchant.merchantManagerId = :managerId', { managerId })
      .andWhere('merchant.status = :status', { status: OperationStatus.ACTIVE })
      .andWhere('post.id = :postId', { postId })
      .getOne();
    return result;
  }

  public async getPostHistoryReport(filter: ExportReportRequest, currentUser: Operation | User) {
    const queryBuilder = this.createQueryBuilder('post')
      .withDeleted()
      .innerJoinAndSelect('post.merchant', 'merchant')
      .innerJoinAndSelect('post.asset', 'asset')
      .innerJoinAndSelect('post.fiat', 'fiat')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
      .leftJoin(
        (qb) =>
          qb
            .from(Order, 'od')
            .leftJoin(Appeal, 'appeal', 'appeal.id = od.appeal_id')
            .select(`SUM(CASE WHEN od.status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'od_completed')
            .addSelect(
              `SUM(CASE WHEN od.status = ${OrderStatus.CANCELLED} AND od.appeal_id IS NOT NULL AND appeal.decision_result != 5 THEN 1 ELSE 0 END)`,
              'od_cancelled'
            )
            .addSelect(
              `SUM(CASE WHEN od.appeal_id IS NOT NULL AND appeal.admin_id IS NOT NULL AND appeal.decision_result != 5 THEN 1 ELSE 0 END)`,
              'od_appeal'
            )
            .addSelect('od.post_id as post_id')
            .groupBy('od.post_id'),
        'od',
        'od.post_id = post.id'
      )
      .addSelect('od.*')
      .andWhere('post.created_at BETWEEN :from AND :to', {
        from: moment(filter.startDate).utc().startOf('day').toDate(),
        to: moment(filter.endDate).utc().endOf('day').toDate(),
      })
      .orderBy('post.created_at', 'DESC');
    if (filter.tradeType) {
      queryBuilder.andWhere('post.type = :type', { type: filter.tradeType });
    }
    if (filter.assetIds) {
      queryBuilder.andWhere('post.asset_id IN (:...assetId)', { assetId: filter.assetIds });
    }
    if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      queryBuilder.andWhere('merchantManager.id = :managerId', { managerId: currentUser.id });
    } else if (currentUser.type === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.andWhere('post.merchant_id = :merchantId', { merchantId: currentUser.id });
    } else if (currentUser.type === OperationType.SUPER_ADMIN) {
      if (filter.managerIds?.length) {
        queryBuilder.andWhere('merchantManager.id IN (:...managerIds)', { managerIds: filter.managerIds });
      }
    }
    return queryBuilder.stream();
  }

  private buildSortingGetAndCountPostsForMananger<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: Pick<ManagerPostSearchData, 'orderField' | 'orderDirection'>
  ): SelectQueryBuilder<T> {
    if (options.orderField && options.orderDirection) {
      queryBuilder.addOrderBy(
        `${queryBuilder.alias}.${this.getOrderByField(options.orderField)}`,
        options.orderDirection
      );
    }

    return queryBuilder;
  }

  private getOrderByField(field: string) {
    return (
      {
        amount: 'availableAmount',
        id: 'id',
        totalPenaltyFee: 'totalPenaltyFee',
        totalFee: 'totalFee',
        availableAmount: 'availableAmount',
        finishedAmount: 'finishedAmount',
        price: 'price',
        status: 'status',
      }[field] || 'createdAt'
    );
  }

  private buildQuery(withDeleted = false) {
    const queryBuilder = this.createQueryBuilder('post');
    if (withDeleted) {
      queryBuilder.withDeleted();
    }
    return queryBuilder
        .innerJoinAndSelect('post.merchant', 'merchant')
        .innerJoinAndSelect('post.asset', 'asset')
        .innerJoinAndSelect('post.fiat', 'fiat')
        .innerJoinAndSelect('merchant.statistic', 'merchantStatistic')
        // .innerJoinAndSelect('merchantStatistic.operation', 'merchantStatisticUser')
        .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
        .innerJoinAndSelect('merchantManager.statistic', 'merchantManagerStatistic')
        .leftJoinAndSelect('merchant.masterDataLevel', 'MasterDataLevel')
  }

  private buildOptionsGetMechantPosts(options: FindMerchantPost) {
    const { merchantId, merchantType, postStatus, tradeType } = options;
    const queryBuilder = this.buildQuery();
    if (merchantType === OperationType.MERCHANT_OPERATOR) {
      queryBuilder.where('post.merchantId = :merchantId', { merchantId });
    }
    if (merchantType === OperationType.MERCHANT_MANAGER) {
      queryBuilder.where(
        'post.merchantId IN (select operation.id from operations operation where operation.merchant_manager_id = :merchantId)',
        {
          merchantId,
        }
      );
    }

    if (postStatus) {
      queryBuilder.andWhere('post.status = :postStatus', { postStatus });
    }

    if (tradeType) {
      queryBuilder.andWhere('post.type = :tradeType', { tradeType });
    }
    return queryBuilder;
  }

  private buildOptionsGetAllPosts(options: FindAllPost) {
    const { postStatus, tradeType, paymentMethodIds, postIds, assetIds } = options;
    const queryBuilder = this.buildQuery();
    if (postStatus) {
      queryBuilder.where('post.status = :postStatus', { postStatus });
    }
    if (tradeType) {
      queryBuilder.andWhere('post.type = :tradeType', { tradeType });
    }
    if (paymentMethodIds && paymentMethodIds.length) {
      queryBuilder.andWhere('post.paymentMethodId IN (:...paymentMethodIds)', { paymentMethodIds });
    }
    if (postIds && postIds.length) {
      queryBuilder.andWhere('post.id IN (:...postIds)', { postIds });
    }
    if (assetIds && assetIds.length) {
      queryBuilder.andWhere('post.assetId IN (:...assetIds)', { assetIds });
    }
    return queryBuilder;
  }

  private buildOptionsGetAllPostsByMultiStatus(options: FindAllPostByMultiStatus) {
    const { postStatus, tradeType, paymentMethodIds, postIds } = options;
    const queryBuilder = this.buildQuery();
    if (postStatus) {
      queryBuilder.where('post.status IN (:...postStatus)', { postStatus });
    }
    if (tradeType) {
      queryBuilder.andWhere('post.type = :tradeType', { tradeType });
    }
    if (paymentMethodIds && paymentMethodIds.length) {
      queryBuilder.andWhere('post.paymentMethodId IN (:...paymentMethodIds)', { paymentMethodIds });
    }
    if (postIds && postIds.length) {
      queryBuilder.andWhere('post.id IN (:...postIds)', { postIds });
    }

    return queryBuilder;
  }

  private buildSortingGetAndCountPosts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: Pick<QueryPostData, 'orderField' | 'orderDirection'>
  ): SelectQueryBuilder<T> {
    if (options.orderField && options.orderDirection) {
      queryBuilder.addOrderBy(
        `${queryBuilder.alias}.${this.getOrderByField(options.orderField)}`,
        options.orderDirection
      );
    }
    queryBuilder
      .addSelect(
        `(CASE WHEN ${queryBuilder.alias}.status=${PostStatus.ONLINE} THEN 0 WHEN ${queryBuilder.alias}.status=${PostStatus.OFFLINE} THEN 1 ELSE 2 END)`,
        '_sortStaus'
      )
      .addOrderBy('_sortStaus', 'ASC');
    queryBuilder
      .addSelect(
        `(CASE WHEN ${queryBuilder.alias}.type LIKE '${TradeType.BUY}' THEN 0 WHEN ${queryBuilder.alias}.type LIKE '${TradeType.SELL}' THEN 1 ELSE 2 END)`,
        '_sortType'
      )
      .addOrderBy('_sortType', 'ASC');
    queryBuilder
      .addSelect(
        `(CASE WHEN ${queryBuilder.alias}.type LIKE '${TradeType.BUY}' THEN ${queryBuilder.alias}.realPrice END)`,
        '_sortPriceBuy'
      )
      .addOrderBy('_sortPriceBuy', 'DESC');
    queryBuilder
      .addSelect(
        `(CASE WHEN ${queryBuilder.alias}.type LIKE '${TradeType.SELL}' THEN ${queryBuilder.alias}.realPrice END)`,
        '_sortPriceSell'
      )
      .addOrderBy('_sortPriceSell', 'ASC');
    return queryBuilder;
  }
}
