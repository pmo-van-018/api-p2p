import { Service } from 'typedi';
import BigNumber from 'bignumber.js';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { PostError } from '@api/post/errors/PostError';
import { BLOCKCHAIN_NETWORKS, PostStatus, TradeType } from '@api/common/models';
import { Operation } from '@api/profile/models/Operation';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { PostConfigurationType } from '@api/post/types/Post';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { MerchantUpdatePostRequest } from '@api/post/requests/Merchant';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { CreatePostRequest } from '@api/post/requests/Merchant/CreatePostRequest';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Post } from '@api/post/models/Post';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { delSortedCache, getRecommendPriceCacheKey } from '@base/utils/redis-client';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

@Service()
export class UpdatePostByManagerUseCase {
  constructor(
    private masterDataService: SharedMasterDataService,
    private resourceService: SharedResourceService,
    private statisticService: SharedStatisticService,
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
  }
  public async updatePost(currentUser: Operation, postRequest: MerchantUpdatePostRequest) {
    this.log.debug(
      `Start implement updatePostingByOperator method for ${currentUser.type} ${currentUser.walletAddress} and post ${postRequest.id}`
    );
    const post = await this.postService.getMerchantPostWithLock({ refId: postRequest.id, merchantManagerId: currentUser.id });
    if (!post) {
      return PostError.POST_NOT_FOUND;
    }
    const masterDataLevel = await this.masterDataService.getLatestMasterDataLevel(currentUser.merchantLevel ?? MIN_MERCHANT_LEVEL);
    if (post.status === PostStatus.CLOSE) {
      return PostError.CANNOT_UPDATE_CLOSED_POST;
    }

    const enableAssets = await this.resourceService.getEnableAssets();
    if (!enableAssets?.find((e) => e.id === post.assetId)) {
      return PostError.ASSET_IS_INVALID;
    }

    const masterDataCommon = await this.masterDataService.getLatestMasterDataCommon();
    if (
      postRequest.showAd &&
      post.type === TradeType.SELL
    ) {
      const isValid = await this.postService.isPaymentMethodValid(postRequest.paymentMethodId || post.paymentMethodId, masterDataCommon);
      if  (!isValid) {
        return PostError.CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED;
      }
    }

    if (
      postRequest.showAd &&
      postRequest.showAd !== post.status &&
      post.type === TradeType.SELL &&
      !post.paymentMethodId &&
      !postRequest.paymentMethodId
    ) {
      return PostError.CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED;
    }

    const userToMerchantTime =
      post.type === TradeType.SELL ? masterDataCommon.userToMerchantTimeBuys : masterDataCommon.userToMerchantTimeSells;
    const data: PostConfigurationType = {
      minPostLimit: masterDataCommon.minPostLimit,
      maxPostLimit: masterDataCommon.maxPostLimit,
      minOrderLimit: masterDataCommon.minOrderLimit,
      maxOrderLimit: masterDataCommon.maxOrderLimit,
      availableAmount: postRequest.availableAmount || post.availableAmount,
      upperFiatLimit: postRequest.upperFiatLimit || post.maxOrderAmount,
      lowerFiatLimit: postRequest.lowerFiatLimit || post.minOrderAmount,
      type: post.type,
      precision: post.asset.precision,
      price: postRequest.price || post.price,
    };
    this.log.debug(`Start implement validateSystemConfiguration method with params ${JSON.stringify(data)}`);
    const realPrice = this.postService.getRealPrice(masterDataLevel.fee, data.price, data.type, data.precision);
    const isAvailableAmountLessThanMin =
      Number(data.availableAmount) < Number(new BigNumber(data.minPostLimit).dividedBy(realPrice).toFixed(2));
    const isMaxLimitGreaterThanAvailableAmount =
      Number(data.availableAmount) > Number(new BigNumber(data.maxPostLimit).dividedBy(realPrice).toFixed(2));

    if (isAvailableAmountLessThanMin || isMaxLimitGreaterThanAvailableAmount) {
      return PostError.CRYPTO_AMOUNT_EXCEEDS_THE_SYSTEM_LIMIT;
    }
    if (new BigNumber(data.lowerFiatLimit).lt(new BigNumber(data.minOrderLimit))) {
      return PostError.LOWER_FIAT_LIMIT_IS_SMALLER_THAN_LOWEST_SYSTEM_LIMIT;
    }
    if (new BigNumber(data.upperFiatLimit).gt(new BigNumber(data.maxOrderLimit))) {
      return PostError.UPPER_FIAT_LIMIT_IS_HIGHER_THAN_HIGHEST_SYSTEM_LIMIT;
    }
    this.log.debug(`Stop implement validateSystemConfiguration method with params ${JSON.stringify(data)}`);
    this.log.debug(`[updatePosting] Validate user to merchant time ${userToMerchantTime}`);
    if (
      postRequest.userToMerchantTime &&
      !userToMerchantTime.find((e) => Number(e) === postRequest.userToMerchantTime)
    ) {
      return PostError.USER_TO_MERCHANT_TIME_IS_INVALID;
    }
    if (
      postRequest.price ||
      postRequest.availableAmount ||
      postRequest.upperFiatLimit ||
      postRequest.lowerFiatLimit
    ) {
      if (
        BigNumber(postRequest.upperFiatLimit || post.maxOrderAmount).isLessThanOrEqualTo(
          postRequest.lowerFiatLimit || post.minOrderAmount
        )
      ) {
        return PostError.UPPER_FIAT_LIMIT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT;
      }
      if (
        this.postService.isAvailableAmountLessThanMin(
          { ...postRequest, type: post.type } as unknown as CreatePostRequest,
          masterDataLevel.fee,
          post.asset.precision,
          post
        )
      ) {
        return PostError.CRYPTO_AMOUNT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT;
      }
      if (
        this.postService.isUpperLimitGreaterThanAvailableAmount(
          { ...postRequest, type: post.type } as unknown as CreatePostRequest,
          masterDataLevel.fee,
          post.asset.precision,
          post
        )
      ) {
        return PostError.CRYPTO_AMOUNT_IS_SMALLER_THAN_UPPER_ORDER_LIMIT;
      }
    }
    await this.updatePostingByOperatorTransactional({ currentUser, post, postRequest, masterDataLevel });
    await this.postService.refreshCachePost();
    this.eventDispatcher.dispatch(events.actions.post.managerUpdatePost, post);
    this.log.debug(
      `Stop implement updatePostingByOperator method for ${currentUser.type} ${currentUser.walletAddress} and post ${postRequest.id}`
    );
    return null;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async updatePostingByOperatorTransactional(data: {
    currentUser: Operation;
    post: Post;
    postRequest: MerchantUpdatePostRequest;
    masterDataLevel: MasterDataLevel;
  }): Promise<void> {
    const { currentUser, post, postRequest, masterDataLevel } = data;
    this.log.debug(
      `Start implement updatePostingByOperatorTransactional method for ${currentUser.type} ${currentUser.walletAddress} and post ${post.id}`
    );
    const realPrice = postRequest.price
      ? this.postService.getRealPrice(
        masterDataLevel.fee,
        postRequest.price || post.price,
        post.type,
        post.asset.precision
      )
      : post.realPrice;
    const postStatus = postRequest.showAd !== undefined ? postRequest.showAd : post.status;
    await this.postService.update(post.id, {
      paymentMethodId: postRequest.paymentMethodId || post.paymentMethodId,
      paymentTimeLimit: postRequest.userToMerchantTime || post.paymentTimeLimit,
      price: postRequest.price || post.price,
      realPrice,
      availableAmount: postRequest.availableAmount || post.availableAmount,
      finishedAmount: post.finishedAmount,
      blockAmount: post.blockAmount,
      totalAmount: postRequest.availableAmount
        ? new BigNumber(postRequest.availableAmount).plus(post.finishedAmount).plus(post.blockAmount).toNumber()
        : post.totalAmount,
      minOrderAmount: postRequest.lowerFiatLimit || post.minOrderAmount,
      maxOrderAmount: postRequest.upperFiatLimit || post.maxOrderAmount,
      status: postStatus,
      note: postRequest.merchantNote ?? post.note,
      updatedBy: currentUser.id,
      benchmarkPrice: post.asset.network !== BLOCKCHAIN_NETWORKS.KDONG ? (postRequest.benchmarkPrice || post.benchmarkPrice) : null,
      benchmarkPercent: post.asset.network !== BLOCKCHAIN_NETWORKS.KDONG ? (postRequest.benchmarkPercent || post.benchmarkPercent) : null,
    });
    if ([PostStatus.ONLINE, PostStatus.OFFLINE].includes(postRequest.showAd) && postRequest.showAd !== post.status) {
      await this.statisticService.updatePostCount(currentUser.id, postRequest.showAd === PostStatus.ONLINE);
    }
    const sortedCacheKey = getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type });
    if (postStatus === PostStatus.ONLINE) {
      await this.postService.setRecommendPrice({
        assetId: post.assetId,
        postType: post.type,
        postId: post.id,
        price: realPrice,
      });
    } else {
      await delSortedCache(sortedCacheKey, post.id);
    }
    this.log.debug(
      `Stop implement updatePostingByOperatorTransactional method for ${currentUser.type} ${currentUser.walletAddress} and post ${post.id}`
    );
  }
}
