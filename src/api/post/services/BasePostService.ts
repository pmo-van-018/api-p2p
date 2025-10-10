import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import {OperationType, PostStatus, TradeType} from '@api/common/models/P2PEnum';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Post } from '@api/post/models/Post';
import { PostRepository } from '@api/post/repositories/PostRepository';
import { CreatePostRequest } from '@api/post/requests/Merchant/CreatePostRequest';
import BigNumber from 'bignumber.js';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {
  deleteCacheWildcard,
  getCache,
  getRecommendPriceCacheKey,
  setCache,
  setSortedCache
} from '@base/utils/redis-client';
import { SavePriceCache } from '@api/post/types/Post';
import { In, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Service()
export class BasePostService {
  constructor(
    @InjectRepository() protected postRepository: PostRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  public async getById(id: string): Promise<Post | null> {
    return await this.postRepository.findOne({ id });
  }

  public getRealPrice(fee: number, price: number, type: TradeType, precision: number): number {
    const feeNumber = new BigNumber(1).plus(fee).toNumber();
    let realPrice: number;
    switch (type) {
      case TradeType.BUY:
        realPrice = Helper.round(new BigNumber(price).dividedBy(feeNumber).toNumber(), precision, 'floor');
        break;
      case TradeType.SELL:
        realPrice = Helper.round(new BigNumber(price).multipliedBy(feeNumber).toNumber(), precision, 'ceil');
        break;
      default:
        realPrice = -Infinity;
        break;
    }
    return realPrice;
  }

  public isAvailableAmountLessThanMin(
    postRequest: CreatePostRequest,
    fee: number,
    precision: number,
    post?: Post
  ) {
    this.log.debug(`Start implement isAvailableAmountLessThanMin method with params ${JSON.stringify(postRequest)}`);
    const realPrice = this.getRealPrice(
      fee,
      postRequest.price || post.price,
      postRequest.type,
      precision
    );
    this.log.debug(`Stop implement isAvailableAmountLessThanMin method with params ${JSON.stringify(postRequest)}`);
    return (
      Number(postRequest.availableAmount || post?.availableAmount) <
      Number(new BigNumber(postRequest.lowerFiatLimit || post?.minOrderAmount).dividedBy(realPrice).toFixed(2))
    );
  }

  public isUpperLimitGreaterThanAvailableAmount(
    postRequest: CreatePostRequest,
    fee: number,
    precision: number,
    post?: Post
  ) {
    const realPrice = this.getRealPrice(
      fee,
      postRequest.price || post.price,
      postRequest.type,
      precision
    );
    return (
      Number(new BigNumber(postRequest.upperFiatLimit || post?.maxOrderAmount).dividedBy(realPrice).toFixed(2)) >
      Number(postRequest.availableAmount || post?.availableAmount)
    );
  }

  public async setRecommendPrice(data: SavePriceCache) {
    this.log.debug(`Start implement setRecommendPrice method with params ${JSON.stringify(data)}`);
    const sortedCacheKey = getRecommendPriceCacheKey({ assetId: data.assetId, postType: data.postType });
    const cacheValue: SavePriceCache = {
      assetId: data.assetId,
      postType: data.postType,
    };
    let assets: SavePriceCache[] = await getCache(this.getKeyPriceAssets());
    if (assets?.length) {
      const asset = assets.find((e) => e.assetId === data.assetId && e.postType === data.postType);
      if (!asset) {
        assets.push(cacheValue);
      }
    } else {
      assets = [cacheValue];
    }
    await Promise.all([
      setSortedCache(sortedCacheKey, data.price, data.postId),
      setCache(this.getKeyPriceAssets(), assets),
    ]);
    this.log.debug(`Stop implement setRecommendPrice method with params ${JSON.stringify(data)}`);
  }

  public async refreshCachePost(): Promise<void> {
    this.log.debug(`Start implement refreshCachePost method`);
    await deleteCacheWildcard(`__cache_post_*`);
    this.log.debug(`Stop implement refreshCachePost method`);
  }

  public getKeyPriceAssets() {
    return `_cache_asset_price_`;
  }

  public convertKeyPriceToAsset(key: string) {
    const keySplits = key.split('#');
    return {
      assetId: keySplits[1],
      postType: keySplits[2],
    };
  }

  protected async getMerchantPosts(options: {
    merchantId: string;
    merchantType: OperationType;
    postStatus?: PostStatus | PostStatus[];
  }): Promise<Post[]> {
    return await this.postRepository.getMerchantPosts(options);
  }

  protected async bulkUpdate(postIds: string[], partialEntity: QueryDeepPartialEntity<Post>): Promise<UpdateResult> {
    return await this.postRepository.update({ id: In(postIds) }, partialEntity);
  }

  protected async offlinePosts(postIds: string[]): Promise<UpdateResult> {
    return await this.postRepository.update({ id: In(postIds) }, { status: PostStatus.OFFLINE });
  }
}
