import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { P2PError } from '@api/common/errors/P2PError';
import {
  OperationType,
  PostStatus,
  TradeType,
} from '@api/common/models/P2PEnum';
import { PaginationResult } from '@api/common/types';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { PostError } from '@api/post/errors/PostError';
import { Post } from '@api/post/models/Post';
import { PostRepository } from '@api/post/repositories/PostRepository';
import { PostCreateRequest } from '@api/post/requests/PostCreateRequest';
import {
  PostSearchOptionsType,
  QueryPostData,
  SearchPost,
} from '@api/post/types/Post';
import { Operation } from '@api/profile/models/Operation';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { delSortedCache, getRecommendPriceCacheKey } from '@base/utils/redis-client';
import BigNumber from 'bignumber.js';
import flattenDepth from 'lodash/flattenDepth';
import { FindConditions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { BasePostService } from '@api/post/services/BasePostService';

@Service()
export class PostService extends BasePostService {
  constructor(
    @InjectRepository() protected postRepository: PostRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private statisticService: SharedStatisticService,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(postRepository, log);
  }

  public async getBuyOnlineInfo(postId: string): Promise<Post | null> {
    return await this.postRepository.getBuyOnlineInfo(postId);
  }

  public async getById(id: string): Promise<Post | null> {
    return await this.postRepository.findOne({ id });
  }

  public async save(post: Post): Promise<Post> {
    return await this.postRepository.save(post);
  }

  public async create({
    postRequest,
    currentUser,
    masterDataLevel,
    assetPrecision,
  }: {
    postRequest: PostCreateRequest;
    currentUser: Operation;
    masterDataLevel: MasterDataLevel;
    assetPrecision: number;
  }): Promise<Post> {
    const post = new Post();
    post.merchantId = currentUser.id;
    post.assetId = postRequest.assetId;
    post.fiatId = postRequest.fiatId;
    post.availableAmount = postRequest.availableAmount;
    post.finishedAmount = 0;
    post.blockAmount = 0;
    post.totalAmount = postRequest.availableAmount;
    post.maxOrderAmount = postRequest.upperFiatLimit;
    post.minOrderAmount = postRequest.lowerFiatLimit;
    post.status = postRequest.showAd;
    post.paymentTimeLimit = postRequest.userToMerchantTime;
    post.type = postRequest.postType;
    if (postRequest.postType === TradeType.SELL) {
      post.paymentMethodId = postRequest.paymentMethodId;
    }
    post.price = postRequest.fixedPriceBeforeFee;
    post.totalFee = 0;
    post.totalPenaltyFee = 0;
    // after fee
    post.realPrice = this.getRealPrice(masterDataLevel.fee, post.price, postRequest.postType, assetPrecision);
    post.note = postRequest.merchantNote;
    post.createdBy = currentUser.id;
    post.updatedBy = currentUser.id;
    post.id = (await this.postRepository.insert(post)).identifiers[0]['id'];
    return post;
  }

  public async findOneWithConditions(
    conditions: FindConditions<Post>,
    options?: FindOneOptions<Post>
  ): Promise<Post | null> {
    return await this.postRepository.findOne(conditions, options);
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<Post>): Promise<any> {
    const post = this.postRepository.merge(this.postRepository.create(), { id, ...(partialEntity as any) });
    return await this.postRepository.save(post, { reload: false });
  }

  public async findAll(queryPostData: QueryPostData): Promise<PaginationResult<Post>> {
    const [posts, total] = await this.postRepository.getAndCountPosts(queryPostData);
    return { items: posts, totalItems: total };
  }

  public async delete(id: string): Promise<any> {
    return await this.postRepository.softDelete(id);
  }

  // Update when order completed
  public async updateFinishedAmount(id: string, amount: number): Promise<Post | null> {
    try {
      this.log.debug(`Start implement updateFinishedAmount with params: ${JSON.stringify({ id, amount })}`);
      const post = await this.postRepository.findOne(id);
      if (!post) {
        throw new P2PError(PostError.POST_NOT_FOUND);
      }
      post.id = id;
      post.blockAmount = new BigNumber(post.blockAmount).minus(amount).toNumber();
      post.finishedAmount = new BigNumber(post.finishedAmount).plus(amount).toNumber();
      // Due to businees, close post if fullfill
      post.status = new BigNumber(post.finishedAmount).isEqualTo(new BigNumber(post.totalAmount))
        ? PostStatus.CLOSE
        : post.status;
      this.eventDispatcher.dispatch(events.actions.system.availableAmountEqualZero, post.orders);
      this.log.debug(`Stop implement updateFinishedAmount with params: ${JSON.stringify({ id, amount })}`);
      return await this.postRepository.save(post);
    } catch (error: any) {
      throw new Error(`[${this.updateFinishedAmount.name}] failed: ${error.message ?? error}`);
    }
  }

  // Update when create an orders
  // tslint:disable-next-line:typedef
  public async updateBlockAmount(id: string, amount: number, isUpdateAvailableAmount = true): Promise<void> {
    this.log.debug('Start implement updateBlockAmount method for: ', id, amount, isUpdateAvailableAmount);
    const post = await this.postRepository
      .createQueryBuilder('post')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('post.id = :id', { id })
      .getOne();
    if (!post) {
      throw new P2PError(PostError.POST_NOT_FOUND);
    }
    post.blockAmount = new BigNumber(post.blockAmount).plus(amount).toNumber();
    if (isUpdateAvailableAmount) {
      post.availableAmount = new BigNumber(post.availableAmount).minus(amount).toNumber();
    }
    await this.postRepository.save(post, { reload: false });
    this.log.debug(
      `Stop implement updateBlockAmount with params: ${JSON.stringify({ id, amount, isUpdateAvailableAmount })}`
    );
  }

  public async changeAmount(id: string, amount: number | string): Promise<Post | null> {
    try {
      const post = await this.postRepository.findOne(id);
      if (!post) {
        throw new P2PError(PostError.POST_NOT_FOUND);
      }
      post.id = id;
      post.blockAmount = new BigNumber(post.blockAmount).plus(amount).toNumber();
      post.totalAmount = new BigNumber(post.totalAmount).plus(amount).toNumber();
      return await this.postRepository.save(post);
    } catch (error: any) {
      throw new Error(`[${this.updateBlockAmount.name}] failed: ${error.message ?? error}`);
    }
  }

  // Update when an order is waiting and end user cancelled it.
  public async updateAvailableAmount(id: string, amount: number): Promise<void> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('post.id = :id', { id })
      .getOne();
    if (!post) {
      throw new P2PError(PostError.POST_NOT_FOUND);
    }
    post.blockAmount = new BigNumber(post.blockAmount).minus(amount).toNumber();
    post.availableAmount = new BigNumber(post.availableAmount).plus(amount).toNumber();
    await this.postRepository.update(post.id, post);
  }

  public async updateFinishedAmountAndFee(
    id: string,
    amount: number,
    feeAmount: number,
    // tslint:disable-next-line:typedef
    changeTotalAmount = 0
  ): Promise<Post | null> {
    try {
      const post = await this.postRepository.findOne(id);
      if (!post) {
        throw new P2PError(PostError.POST_NOT_FOUND);
      }
      post.id = id;
      post.blockAmount = new BigNumber(post.blockAmount).minus(amount).toNumber();
      post.finishedAmount = new BigNumber(post.finishedAmount).plus(amount).toNumber();
      post.totalFee = new BigNumber(post.totalFee).plus(feeAmount).toNumber();
      post.totalAmount = new BigNumber(post.totalAmount).plus(changeTotalAmount).toNumber();
      // Due to business, offline post if fulfill
      const isFullFill = new BigNumber(post.finishedAmount).isEqualTo(new BigNumber(post.totalAmount));
      post.status = isFullFill ? PostStatus.CLOSE : post.status;
      if (isFullFill) {
        await this.statisticService.updatePostCount(post.merchantId, false);
      }
      return await this.postRepository.save(post);
    } catch (error: any) {
      throw new Error(`[${this.updateAvailableAmount.name}] failed: ${error.message ?? error}`);
    }
  }

  public async updatePenaltyFeeAmount(id: string, amount: number): Promise<Post | null> {
    try {
      const post = await this.postRepository.findOne(id);
      if (!post) {
        throw new P2PError(PostError.POST_NOT_FOUND);
      }
      post.id = id;
      post.totalPenaltyFee = new BigNumber(post.totalPenaltyFee).plus(amount).toNumber();
      return await this.postRepository.save(post);
    } catch (error: any) {
      throw new Error(`[${this.updatePenaltyFeeAmount.name}] failed: ${error.message ?? error}`);
    }
  }

  public async countMerchantPosts(merchantId: string, merchantType: OperationType) {
    this.log.debug(`Start implement countMerchantPosts with params: ${JSON.stringify({ merchantId, merchantType })}`);
    const posts = await this.postRepository.countPostByMerchantAndStatus(merchantId, merchantType);
    const onlinePostTotal = posts.filter((post) => post.status === PostStatus.ONLINE)[0]?.total ?? 0;
    const offlinePostTotal = posts.filter((post) => post.status === PostStatus.OFFLINE)[0]?.total ?? 0;
    this.log.debug(`Stop implement countMerchantPosts with params: ${JSON.stringify({ merchantId, merchantType })}`);
    return { onlinePost: Number(onlinePostTotal), offlinePost: Number(offlinePostTotal) };
  }

  public async getFullPostInfoById({ id, merchantId }: { id: string; merchantId: string }): Promise<Post | null> {
    return await this.postRepository.findOneOrFail(
      { id, merchantId },
      {
        relations: ['merchant', 'fiat', 'asset', 'paymentMethod', 'paymentMethod.paymentMethodFields'],
      }
    );
  }

  public async getPostHistoryById({ id, merchantId }: { id: string; merchantId: string }): Promise<Post | null> {
    return await this.postRepository.findOneOrFail(
      { id, merchantId, status: PostStatus.CLOSE },
      {
        relations: ['merchant', 'fiat', 'asset'],
      }
    );
  }

  /**
   * Retrieve options, which are used to search list of posts with some parameters
   * @param {PostSearchOptionsType} postSearchOptionsType The request parameters
   * @returns {{ maxAmount: number }}
   */
  public async getPostSearchOptions(postSearchOptionsType: PostSearchOptionsType) {
    this.log.debug(`Start implement getPostSearchOptions with params: ${JSON.stringify(postSearchOptionsType)}`);
    const typePostReversed = postSearchOptionsType.type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;
    // Get the maximum value of the "max_order_amount" field from the posts by parameters
    const maxAmountQueryResult = await this.postRepository.getAmountRange({
      ...postSearchOptionsType,
      type: typePostReversed,
    });
    const maxAmount = maxAmountQueryResult?.maxAmount || 0;

    this.log.debug(`Stop implement getPostSearchOptions with params: ${JSON.stringify(postSearchOptionsType)}`);
    return { maxAmount: Number(maxAmount) };
  }

  public async updateAndRetrieveOfflineAllPostsOfPaymentMethod(
    paymentMethodIds: string[]
  ): Promise<{ total: number; items: Post[] }> {
    this.log.debug(`Start implement updateAndRetrieveOfflineAllPostsOfPaymentMethod with params: ${paymentMethodIds}`);
    const posts = await this.postRepository.countAllPostsByMerchantOperator({
      postStatus: PostStatus.ONLINE,
      tradeType: TradeType.SELL,
      paymentMethodIds,
    });
    if (!posts.length) {
      return { total: 0, items: [] };
    }
    const postsFlattened = flattenDepth(posts.map((post) => post.postIds.split(',')));
    const result = await this.bulkUpdate(postsFlattened, { status: PostStatus.OFFLINE });
    posts.map(async (post) => {
      await this.statisticService.updatePostCount(post.merchantId, false, post.total);
    });
    const retrievePosts = await this.postRepository.getAllPostsByOptions({
      postStatus: PostStatus.OFFLINE,
      tradeType: TradeType.SELL,
      paymentMethodIds,
      postIds: postsFlattened,
    });
    retrievePosts.map(async (post) => {
      const sortedCacheKey = getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type });
      await delSortedCache(sortedCacheKey, post.id);
    });
    this.log.debug(`Stop implement updateAndRetrieveOfflineAllPostsOfPaymentMethod with params: ${paymentMethodIds}`);
    return { total: result.affected, items: retrievePosts };
  }

  public async updateAndRetrieveOfflineAllPostsOfAsset(assetIds: string[]): Promise<{ total: number; items: Post[] }> {
    this.log.debug(`Start implement updateAndRetrieveOfflineAllPostsOfAsset with params: ${assetIds}`);
    const posts = await this.postRepository.countAllPostsByMerchantOperator({
      postStatus: PostStatus.ONLINE,
      assetIds,
    });
    if (!posts.length) {
      return { total: 0, items: [] };
    }
    const postsFlattened = flattenDepth(posts.map((post) => post.postIds.split(',')));
    const result = await this.bulkUpdate(postsFlattened, { status: PostStatus.OFFLINE });
    posts.map(async (post) => {
      await this.statisticService.updatePostCount(post.merchantId, false, post.total);
    });
    const retrievePosts = await this.postRepository.getAllPostWithAsset({
      postStatus: PostStatus.OFFLINE,
      assetIds,
      postIds: postsFlattened,
    });
    retrievePosts.map(async (post) => {
      const sortedCacheKey = getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type });
      await delSortedCache(sortedCacheKey, post.id);
    });
    this.log.debug(`Stop implement updateAndRetrieveOfflineAllPostsOfAsset with params: ${assetIds}`);
    return { total: result.affected, items: retrievePosts };
  }

  public async updateAndRetrieveOfflineAllPostsByPaymentMethodOfManager(
    paymentMethodIds: string[],
    updateParam: object
  ): Promise<{ items: Post[] }> {
    return await this.storePostsByStatus([PostStatus.ONLINE], paymentMethodIds, updateParam);
  }

  public async deleteAndRetrieveOfflineAllPostsByPaymentMethodOfManager(
    paymentMethodIds: string[],
    updateParam: object
  ): Promise<{ items: Post[] }> {
    const result = await this.storePostsByStatus([PostStatus.ONLINE], paymentMethodIds, updateParam);
    await Promise.all([
      this.storePostsByStatus([PostStatus.CLOSE], paymentMethodIds, { paymentMethodId: null }),
      this.storePostsByStatus([PostStatus.OFFLINE], paymentMethodIds, updateParam),
    ]);
    return result;
  }

  public async countMerchantManagerPosts(userId: string, userType?: OperationType) {
    return await this.postRepository.countMerchantPosts(userId, userType);
  }

  protected getSearchOnlinePostRedisKey(searchPostType: SearchPost): string {
    return `__cache_post_${JSON.stringify(searchPostType, Object.keys(searchPostType).sort())}`;
  }

  private async storePostsByStatus(postStatusList: number[], paymentMethodIds: string[], updateParam: object) {
    this.log.debug(`Start implement storePostsByStatus with params: ${paymentMethodIds}`);
    const posts = await this.postRepository.countAllPostsByMultiStatus({
      postStatus: postStatusList,
      tradeType: TradeType.SELL,
      paymentMethodIds,
    });
    if (!posts.length) {
      return { items: [] };
    }
    const postsFlattened = flattenDepth(posts.map((post) => post.postIds.split(',')));

    this.log.debug(`[storePostsByStatus] update posts with params: ${JSON.stringify(updateParam)}`);
    await this.bulkUpdate(postsFlattened, updateParam);
    posts.map(async (post) => {
      if (postStatusList[0] === PostStatus.ONLINE) {
        await this.statisticService.updatePostCount(post.merchantId, false, post.total);
      }
    });

    const retrievePosts = await this.postRepository.getAllPostsByOptions({
      postStatus: PostStatus.OFFLINE,
      tradeType: TradeType.SELL,
      postIds: postsFlattened,
    });
    retrievePosts.map(async (post) => {
      await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
    });
    this.log.debug(`Stop implement storePostsByStatus with params: ${paymentMethodIds}`);
    return { items: retrievePosts };
  }
}
