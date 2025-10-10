import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PostError } from '@api/post/errors/PostError';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import BigNumber from 'bignumber.js';
import {
  delSortedCache,
  getRecommendPriceCacheKey,
} from '@base/utils/redis-client';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PostRepository } from '../repositories/PostRepository';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { getNamespace } from 'cls-hooked';
import { CURRENT_USER_ID, SECURITY_NAMESPACE } from '@api/middlewares/ClsMiddleware';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class UpdateStatusPostByMerchantUseCase {
  constructor(
    private postService: MerchantPostService,
    private statisticService: SharedStatisticService,
    private paymentMethodService: SharedPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private resourceService: SharedResourceService,
    @InjectRepository() private postRepository: PostRepository,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateStatusPost(
    currentUser: Operation,
    showAd: number,
    refId: string
  ) {
    this.log.debug(
      `Start implement updateStatusPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );
    const post = await this.postService.getFullInfoPostByRefId({ refId, merchantId: currentUser.id });
    if (!post) {
      return PostError.POST_ID_IS_INVALID;
    }
    if (post.status === PostStatus.CLOSE) {
      return PostError.CANNOT_UPDATE_CLOSED_POST;
    }
    if (currentUser.id !== post.merchantId) {
      return PostError.NO_PERMISSION_TO_UPDATE_POST;
    }
    if (post.status === PostStatus.OFFLINE) {
      if (post.type === TradeType.SELL && !post.paymentMethodId) {
        return PostError.PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED;
      }
      if (new BigNumber(post.availableAmount).multipliedBy(post.realPrice).toNumber() < Number(post.minOrderAmount)) {
        return PostError.CRYPTO_AMOUNT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT;
      }
      if (Number(post.maxOrderAmount) <= Number(post.minOrderAmount)) {
        return PostError.UPPER_FIAT_LIMIT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT;
      }
      const enableAssets = await this.resourceService.getEnableAssets();
      if (!enableAssets?.find((e) => e.id === post.assetId)) {
        return PostError.ASSET_IS_INVALID;
      }
    }
    post.updatedBy = currentUser.id;
    const masterDataCommon = await this.masterDataService.getLatestMasterDataCommon();
    this.log.debug(
      `Start implement validPostByPaymentMethodWasDeactivated method for post ${post.id} and postStatus ${showAd}}`
    );
    const paymentMethodCurrently = await this.paymentMethodService.getPaymentMethodById(post.paymentMethodId);
    const paymentMethod = paymentMethodCurrently?.paymentMethodFields.find(
      (item) => item.contentType === CONTENT_TYPE_BANK.BANK_NAME
    );

    let isNotPaymentMethodSupported = true;
    masterDataCommon.supportedBanks.filter((item) => {
      if (item === paymentMethod?.value) {
        isNotPaymentMethodSupported = false;
      }
    });

    if (
      paymentMethod &&
      isNotPaymentMethodSupported &&
      post?.status === PostStatus.OFFLINE &&
      post?.type === TradeType.SELL &&
      showAd === PostStatus.ONLINE
    ) {
      return PostError.CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED;
    }
    this.log.debug(
      `Stop implement validPostByPaymentMethodWasDeactivated method for post ${post.id} and postStatus ${showAd}}`
    );

    await this.updateStatusPostingTransactional({ merchant: currentUser, postId: post.id, showAd });

    await this.postService.refreshCachePost();

    this.log.debug(
      `Stop implement updateStatusPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );

    return null;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async updateStatusPostingTransactional(data: {
    merchant: Operation;
    postId: string;
    showAd: number;
  }): Promise<void> {
    const { merchant, postId, showAd } = data;
    this.log.debug(
      `Start implement updateStatusPostingTransactional method for ${merchant.type} ${merchant.walletAddress} and post ${postId}`
    );
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        merchantId: merchant.id,
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });

    if (showAd !== post.status) {
      await this.statisticService.updatePostCount(merchant.id, showAd === PostStatus.ONLINE);
    }
    if (showAd === PostStatus.OFFLINE) {
      const sortedCacheKey = getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type });
      await delSortedCache(sortedCacheKey, post.id);
    } else {
      await this.postService.setRecommendPrice({
        assetId: post.assetId,
        postType: post.type,
        postId: post.id,
        price: post.realPrice,
      });
    }
    const securityContext = getNamespace(SECURITY_NAMESPACE).get(CURRENT_USER_ID);
    post.status = showAd;
    post.updatedBy = securityContext.id;
    await this.postService.update(post.id, post);
    this.log.debug(
      `Stop implement updateStatusPostingTransactional method for ${merchant.type} ${merchant.walletAddress} and post ${postId}`
    );
  }
}
