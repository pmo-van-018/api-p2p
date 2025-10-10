import { Service } from 'typedi';
import BigNumber from 'bignumber.js';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { CreatePostRequest } from '@api/post/requests/Merchant/CreatePostRequest';
import { getCurrentNetWorkUsedWalletAddress, isUnSupportedNetwork } from '@base/utils/unsupported-network.utils';
import { PostError } from '@api/post/errors/PostError';
import { BLOCKCHAIN_NETWORKS, PostStatus, SupportedAsset, SupportedBank, TradeType } from '@api/common/models';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Operation } from '@api/profile/models/Operation';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { PostConfigurationType } from '@api/post/types/Post';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { Post } from '@api/post/models/Post';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { MerchantCreatePostRequest } from '@api/post/requests/Merchant';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';

@Service()
export class CreatePostUseCase {
  constructor(
    private masterDataService: SharedMasterDataService,
    private resourceService: SharedResourceService,
    private statisticService: SharedStatisticService,
    private postService: MerchantPostService,
    private paymentMethodService: SharedPaymentMethodService,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  public async createPost(currentUser: Operation, postRequest: MerchantCreatePostRequest) {
    this.log.debug(`Start implement createPosting method for ${currentUser.type} ${currentUser.walletAddress}`);

    this.log.debug('[createPosting] Get master data level, master data common, asset, fiat');
    const [masterDataLevel, masterDataCommon, asset, fiat] = await Promise.all([
      this.masterDataService.getLatestMasterDataLevel(currentUser.merchantLevel ?? MIN_MERCHANT_LEVEL),
      this.masterDataService.getLatestMasterDataCommon(),
      this.resourceService.getAssetById(postRequest.assetId),
      this.resourceService.getFiatById(postRequest.fiatId),
    ]);

    if (!masterDataLevel) {
      return PostError.MASTER_DATA_LEVEL_NOT_FOUND;
    }
    if (!asset) {
      return PostError.CRYPTO_TYPE_IS_INVALID;
    }
    if (!fiat) {
      return PostError.FIAT_TYPE_IS_INVALID;
    }

    if (postRequest.type === TradeType.SELL) {
      if (!postRequest.paymentMethodId) {
        return PostError.PAYMENT_METHOD_IS_INVALID;
      }
      const paymentMethod = await this.paymentMethodService.getPaymentMethodById(postRequest.paymentMethodId);
      const bankName = paymentMethod?.paymentMethodFields.find(
        (item) => item.contentType === CONTENT_TYPE_BANK.BANK_NAME
      );

      const isSupportedBank = masterDataCommon.supportedBanks.includes(bankName?.value as SupportedBank);
      if (!isSupportedBank) {
        return PostError.CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED;
      }
    }

    this.log.debug('[createPosting] Validate asset network');
    const currentNetwork = getCurrentNetWorkUsedWalletAddress(currentUser.walletAddress);
    if (isUnSupportedNetwork(currentNetwork, asset.network)) {
      return PostError.WRONG_NETWORK_IN_CREATING_POST;
    }

    const userToMerchantTime =
      postRequest.type === TradeType.SELL
        ? masterDataCommon.userToMerchantTimeBuys
        : masterDataCommon.userToMerchantTimeSells;

    this.log.debug(`[createPosting] Validate user to merchant time ${userToMerchantTime}`);
    const data: PostConfigurationType = {
      minPostLimit: masterDataCommon.minPostLimit,
      maxPostLimit: masterDataCommon.maxPostLimit,
      minOrderLimit: masterDataCommon.minOrderLimit,
      maxOrderLimit: masterDataCommon.maxOrderLimit,
      availableAmount: postRequest.availableAmount,
      upperFiatLimit: postRequest.upperFiatLimit,
      lowerFiatLimit: postRequest.lowerFiatLimit,
      price: postRequest.price,
      precision: asset.precision,
      type: postRequest.type,
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

    if (!userToMerchantTime.find((e) => Number(e) === postRequest.userToMerchantTime)) {
      return PostError.USER_TO_MERCHANT_TIME_IS_INVALID;
    }
    if (this.postService.isAvailableAmountLessThanMin(postRequest, masterDataLevel.fee, asset.precision)) {
      return PostError.CRYPTO_AMOUNT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT;
    }
    if (this.postService.isUpperLimitGreaterThanAvailableAmount(postRequest, masterDataLevel.fee, asset.precision)) {
      return PostError.CRYPTO_AMOUNT_IS_SMALLER_THAN_UPPER_ORDER_LIMIT;
    }
    if (!masterDataCommon.assetNetworkTypes.includes(SupportedAsset[`${asset.name}_${asset.network}`.toUpperCase()])) {
      return PostError.TOKEN_IS_NO_LONGER_SUPPORTED;
    }

    const post = await this.createPostingTransactionalByOperation(
      currentUser,
      postRequest,
      masterDataLevel,
      asset.precision,
      asset.network
    );
    await this.postService.refreshCachePost();
    this.log.debug(`Stop implement createPosting method for ${currentUser.type} ${currentUser.walletAddress}`);
    return post.refId;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async createPostingTransactionalByOperation(
    currentUser: Operation,
    postRequest: CreatePostRequest,
    masterDataLevel: MasterDataLevel,
    assetPrecision: number,
    network: BLOCKCHAIN_NETWORKS
  ): Promise<Post> {
    this.log.debug(
      `Start implement createPostingTransactionalByOperation method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(postRequest)}`
    );
    const post = await this.postService.create(postRequest, currentUser.id, masterDataLevel.fee, assetPrecision, network);
    if (post.status === PostStatus.ONLINE) {
      await this.statisticService.increaseShowPost(currentUser.id);
      await this.postService.setRecommendPrice({
        assetId: post.assetId,
        postType: post.type,
        postId: post.id,
        price: post.realPrice,
      });
    } else {
      await this.statisticService.increaseHidePost(currentUser.id);
    }
    this.log.debug(
      `Stop implement createPostingTransactionalByOperation method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(postRequest)}`
    );
    return post;
  }
}
