import {Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {PostRepository} from '@api/post/repositories/PostRepository';
import BigNumber from 'bignumber.js';
import {Post} from '@api/post/models/Post';
import {GetSortedSetType, OperationType, PostStatus, TradeType} from '@api/common/models';
import {FindOneOptions, In} from 'typeorm';
import {delSortedCache, getCache, getRecommendPriceCacheKey, getSortedCache} from '@base/utils/redis-client';
import flattenDepth from 'lodash/flattenDepth';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {BasePostService} from '@api/post/services/BasePostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {ExportReportRequest} from '@api/statistic/requests/ExportReportRequest';
import {Operation} from '@api/profile/models/Operation';
import {RecommendPriceByUser, SavePriceCache} from '@api/post/types/Post';
import {differenceWith, isEqual} from 'lodash';
import {SharedResourceService} from '@api/master-data/services/SharedResourceService';

@Service()
export class SharedPostService extends BasePostService {
  constructor(
    private statisticService: SharedStatisticService,
    private sharedResourceService: SharedResourceService,
    @InjectRepository() protected postRepository: PostRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(postRepository, log);
  }

  public async getPostByIdWithLock(id: string) {
    return await this.postRepository
      .createQueryBuilder('post')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('post.id = :id', { id })
      .getOne();
  }
  public async updateAvailableAmount(post: Post, amount: number): Promise<void> {
    post.availableAmount = new BigNumber(post.availableAmount).plus(amount).toNumber();
    post.blockAmount = new BigNumber(post.blockAmount).minus(amount).toNumber();
    await this.postRepository.update(post.id, post);
  }

  public async updatePenaltyFeeAmount(post: Post, amount: number) {
    post.totalPenaltyFee = new BigNumber(post.totalPenaltyFee).plus(amount).toNumber();
    await this.postRepository.update(post.id, post);
  }

  public async updateFinishedAmountAndFee(
    post: Post,
    amount: number,
    feeAmount: number,
    changeTotalAmount: number = 0
  ) {
    const finishedAmount = new BigNumber(post.finishedAmount).plus(amount).toNumber();
    const totalAmount = new BigNumber(post.totalAmount).plus(changeTotalAmount).toNumber();
    const isFullFill = new BigNumber(finishedAmount).isEqualTo(totalAmount);
    await this.postRepository.update(post.id, {
      blockAmount: new BigNumber(post.blockAmount).minus(amount).toNumber(),
      totalFee: new BigNumber(post.totalFee).plus(feeAmount).toNumber(),
      totalAmount,
      finishedAmount,
      status: isFullFill ? PostStatus.CLOSE : post.status,
    });
    return { isFullFill };
  }

  public async changeAmount(post: Post, amount: number) {
    await this.postRepository.update(post.id, {
      blockAmount: new BigNumber(post.blockAmount).plus(amount).toNumber(),
      totalAmount: new BigNumber(post.totalAmount).plus(amount).toNumber(),
    });
  }

  public async getOnlinePostsByPaymentMethod(paymentMethodId: string) {
    return await this.postRepository.getOnlinePostsByPaymentMethod(paymentMethodId);
  }

  public async offlinePostByIds(postIds: string[]) {
    return await this.postRepository.update({ id: In(postIds) }, { status: PostStatus.OFFLINE });
  }

  public async delRecommendPriceCache(posts: Post[]) {
    posts.map(async (post) => {
      await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
    });
  }

  public async removePostPaymentMethod(paymentMethodId: string) {
    return await this.postRepository.update({ paymentMethodId }, { paymentMethodId: null });
  }

  public async offlinePostUsingDisableAssets(assetIds: string[]): Promise<{ total: number; items: Post[] }> {
    this.log.debug(`Start implement updateAndRetrieveOfflineAllPostsOfAsset with params: ${assetIds}`);
    const posts = await this.postRepository.countAllPostsByMerchantOperator({
      postStatus: PostStatus.ONLINE,
      assetIds,
    });
    if (!posts.length) {
      return { total: 0, items: [] };
    }
    const postsFlattened = flattenDepth(posts.map((post) => post.postIds.split(',')));
    const result = await this.offlinePosts(postsFlattened);
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

  public async offlinePostsUsingDisablePaymentMethod(
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
    const result = await this.offlinePosts(postsFlattened);
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

  public async countMerchantManagerPosts(merchantId: string, merchantType: OperationType) {
    return await this.postRepository.countMerchantPosts(merchantId, merchantType);
  }

  public async getPostHistoryReport(filter: ExportReportRequest, currentUser: Operation) {
    return await this.postRepository.getPostHistoryReport(filter, currentUser);
  }

  public async closeAllPostsOfMerchantOperator(merchantOperatorId: string): Promise<{ total: number }> {
    this.log.debug(
      `Start implement closeAllPostsOfMerchantOperator with params: ${JSON.stringify(merchantOperatorId)}`
    );
    const onlinePosts = await this.getMerchantPosts({
      merchantId: merchantOperatorId,
      merchantType: OperationType.MERCHANT_OPERATOR,
      postStatus: [PostStatus.ONLINE, PostStatus.OFFLINE],
    });
    const result = await this.bulkUpdate(
      onlinePosts.map((post) => post.id),
      { status: PostStatus.CLOSE }
    );
    onlinePosts.map(async (post) => {
      await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
    });
    this.log.debug(`Stop implement closeAllPostsOfMerchantOperator with params: ${JSON.stringify(merchantOperatorId)}`);
    return { total: result.affected };
  }

  public async updateOfflinePostOfMerchantOperator(merchantOperatorId: string): Promise<{ total: number }> {
    this.log.debug(`Start implement updateOfflinePostOfMerchantOperator with params: ${merchantOperatorId}`);
    const onlinePosts = await this.getMerchantPosts({
      merchantId: merchantOperatorId,
      merchantType: OperationType.MERCHANT_OPERATOR,
      postStatus: PostStatus.ONLINE,
    });
    const result = await this.bulkUpdate(
      onlinePosts.map((post) => post.id),
      { status: PostStatus.OFFLINE }
    );
    onlinePosts.map(async (post) => {
      await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
    });
    this.log.debug(`Stop implement updateOfflinePostOfMerchantOperator with params: ${merchantOperatorId}`);
    return { total: result.affected };
  }

  // TODO: remove when refactor telegram-bot module
  public async getPrice(): Promise<SavePriceCache[]> {
    this.log.debug(`Start implement getPrice method`);
    const assests = await this.sharedResourceService.getAssets();
    const getPriceAssets: SavePriceCache[] = await getCache(this.getKeyPriceAssets());
    const assestChecker: SavePriceCache[] = [];
    assests.forEach((e) => {
      assestChecker.push({
        assetId: e.id,
        postType: TradeType.BUY,
      });
      assestChecker.push({
        assetId: e.id,
        postType: TradeType.SELL,
      });
    });
    const differenceAssets = differenceWith(assestChecker, getPriceAssets, isEqual);
    if (differenceAssets?.length) {
      const recommends: SavePriceCache[] = await this.postRepository.getListRecommendPrices();
      differenceAssets.forEach(async (asset) => {
        const recommendPrice = recommends.find((rm) => rm.assetId === asset.assetId && rm.postType === asset.postType);
        if (!recommendPrice) {
          return;
        }
        await this.setRecommendPrice({
          assetId: recommendPrice.assetId,
          postType: recommendPrice.postType,
          postId: recommendPrice.postId,
          price: recommendPrice.price,
        });
      });
    }
    const prices: SavePriceCache[] = [];
    for (const assest of assests) {
      const minPriceKey = getRecommendPriceCacheKey({ assetId: assest.id, postType: TradeType.SELL });
      const maxPriceKey = getRecommendPriceCacheKey({ assetId: assest.id, postType: TradeType.BUY });
      const [minPrice, maxPrice] = await Promise.all([
        getSortedCache(minPriceKey, GetSortedSetType.minimum),
        getSortedCache(maxPriceKey, GetSortedSetType.maximum),
      ]);
      const assestBuyByKey = this.convertKeyPriceToAsset(minPriceKey);
      const assestBuy: SavePriceCache = {
        assetId: assestBuyByKey.assetId,
        postType: assestBuyByKey.postType,
        price: minPrice,
      };
      const assestSellByKey = this.convertKeyPriceToAsset(maxPriceKey);
      const assestSell: SavePriceCache = {
        assetId: assestSellByKey.assetId,
        postType: assestSellByKey.postType,
        price: maxPrice,
      };
      prices.push(assestBuy, assestSell);
    }
    this.log.debug(`Stop implement getPrice method`);
    return prices;
  }

  // TODO: remove when refactor telegram-bot module
  public async getRecommendPriceByUser() {
    const [assestPrices, assets, fiat] = await Promise.all([
      this.getPrice(),
      this.sharedResourceService.getEnableAssets(),
      this.sharedResourceService.getFiat(),
    ]);
    const assetMap = new Map<string, RecommendPriceByUser>();
    for (const assestPrice of assestPrices) {
      // Discard asset that is don't have recommend price
      if (!assestPrice.price) {
        continue;
      }

      const asset = assets.find((e) => e.id === assestPrice.assetId);
      if (asset) {
        if (assetMap.has(asset.id)) {
          const assetValue = assetMap.get(asset.id);
          const priceObj = {
            recommendedPrice: assestPrice.price,
            currentTime: new Date(),
          };
          if (assetValue) {
            if (assestPrice.postType === TradeType.SELL) {
              assetValue.buyPrice = priceObj;
            } else {
              assetValue.sellPrice = priceObj;
            }
          }
        } else {
          const assetValue: RecommendPriceByUser = {
            assetName: asset.name,
            assetNetwork: asset.network,
            fiatName: fiat.name,
            buyPrice: {
              recommendedPrice: assestPrice.postType === TradeType.SELL ? assestPrice.price : null,
              currentTime: new Date(),
            },
            sellPrice: {
              recommendedPrice: assestPrice.postType === TradeType.BUY ? assestPrice.price : null,
              currentTime: new Date(),
            },
          };
          assetMap.set(asset.id, assetValue);
        }
      }
    }
    return [...assetMap.values()];
  }

  public async findOneWithLock(refId: string, type: TradeType): Promise<Post | null> {
    return await this.postRepository.findOne({
      refId,
      type,
      status: PostStatus.ONLINE,
    }, {
      select: [
        'id',
        'assetId',
        'fiatId',
        'paymentMethodId',
        'merchantId',
        'paymentTimeLimit',
        'realPrice',
        'availableAmount',
        'minOrderAmount',
        'maxOrderAmount',
        'blockAmount',
        'benchmarkPrice',
        'benchmarkPercent',
      ],
      lock: {
        mode: 'pessimistic_write',
      },
      transaction: true,
      relations: ['merchant', 'asset'],
    });
  }

  public async updateBlockAmount(post: Post, amount: number, isUpdateAvailableAmount = true): Promise<void> {
    this.log.debug('Start implement updateBlockAmount method for: ', post.id, amount, isUpdateAvailableAmount);
    post.blockAmount = new BigNumber(post.blockAmount).plus(amount).toNumber();
    if (isUpdateAvailableAmount) {
      post.availableAmount = new BigNumber(post.availableAmount).minus(amount).toNumber();
    }
    await this.postRepository.save(post, { reload: false });
    this.log.debug(
      `Stop implement updateBlockAmount with params: ${JSON.stringify({ id: post.id, amount, isUpdateAvailableAmount })}`
    );
  }

  public async lockPostBeforeCreateOrder(
    postRefId: string,
    type: TradeType,
    options?: FindOneOptions<Post>
  ): Promise<Post> {
    const post = await this.postRepository.findOne(
      {
        refId: postRefId,
        type,
        status: PostStatus.ONLINE,
      },
      {
        ...options,
        select: [
          ...(options?.select ? options.select : []),
          'id',
          'assetId',
          'fiatId',
          'paymentMethodId',
          'merchantId',
          'paymentTimeLimit',
          'realPrice',
          'availableAmount',
          'minOrderAmount',
          'maxOrderAmount',
          'blockAmount',
          'benchmarkPercent',
          'benchmarkPrice',
        ],
        lock: {
          mode: 'pessimistic_write',
        },
        relations: ['merchant', 'asset'],
      }
    );
    return post;
  }

  public async updateStatus(id: string, status: PostStatus) {
    return await this.postRepository.update(id, { status });
  }

  public getKeyPostLock(key: string) {
    return `post-${key}`;
  }
}
