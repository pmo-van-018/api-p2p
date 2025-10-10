import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { PostService } from '@api/post/services/PostService';
import { Operation } from '@api/profile/models/Operation';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { Post } from '@api/post/models/Post';
import { ManagerPostSearchData, QueryPostData } from '@api/post/types/Post';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PostRepository } from '@api/post/repositories/PostRepository';
import { BasePostService } from '@api/post/services/BasePostService';
import { CreatePostRequest } from '@api/post/requests/Merchant/CreatePostRequest';
import { BLOCKCHAIN_NETWORKS, PostStatus, SupportedBank, TradeType } from '@api/common/models';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Not } from 'typeorm';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

@Service()
export class MerchantPostService extends BasePostService {
  constructor(
    private orderService: SharedOrderService,
    private postService: PostService,
    private sharedPaymentMethodService: SharedPaymentMethodService,
    @InjectRepository() protected postRepository: PostRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(postRepository, log);
  }

  public async create(postRequest: CreatePostRequest, merchantId: string, fee: number, precision: number, network: BLOCKCHAIN_NETWORKS): Promise<Post> {
    const post = new Post();
    post.merchantId = merchantId;
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
    post.type = postRequest.type;
    post.paymentMethodId = postRequest.type === TradeType.SELL ? postRequest.paymentMethodId : null;
    post.price = postRequest.price;
    post.totalFee = 0;
    post.totalPenaltyFee = 0;
    post.realPrice = this.getRealPrice(fee, postRequest.price, postRequest.type, precision);
    post.note = postRequest.merchantNote;
    post.createdBy = merchantId;
    post.updatedBy = merchantId;
    // Ommit benchmarkPrice and benchmarkPercent if network is KDONG because Binace does not support this chain
    if (network !== BLOCKCHAIN_NETWORKS.KDONG) {
      post.benchmarkPrice = postRequest.benchmarkPrice;
      post.benchmarkPercent = postRequest.benchmarkPercent;
    }
    post.id = (await this.postRepository.insert(post)).identifiers[0]['id'];
    return post;
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<Post>): Promise<any> {
    const post = this.postRepository.merge(this.postRepository.create(), { id, ...(partialEntity as any) });
    return await this.postRepository.save(post, { reload: false });
  }

  public async getMerchantPostWithLock(
    {
      refId,
      merchantId,
      merchantManagerId,
    }: { refId: string; merchantId?: string; merchantManagerId?: string }
  ): Promise<Post | null> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.merchant', 'merchant')
      .innerJoinAndSelect('post.asset', 'asset')
      .innerJoinAndSelect('post.fiat', 'fiat')
      .leftJoinAndSelect('post.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodFields')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('post.refId = :refId', { refId });
    if (merchantId) {
      queryBuilder.andWhere('post.merchant_id = :merchantId', { merchantId });
    }
    if (merchantManagerId) {
      queryBuilder.andWhere('merchant.merchant_manager_id = :merchantManagerId', { merchantManagerId });
    }
    return await queryBuilder.getOne();
  }

  public async countMerchantPostsAndOrders(currentUser: Operation) {
    try {
      this.log.debug(`Start implement countMerchantPostsAndOrders method for merchant ${currentUser.walletAddress}`);
      const countOrders = await this.orderService.countMerchantOrders(currentUser.id, currentUser.type);
      const countPosts = await this.postService.countMerchantPosts(currentUser.id, currentUser.type);
      this.log.debug(`Stop implement countMerchantPostsAndOrders method for merchant ${currentUser.walletAddress}`);
      return { ...countOrders, ...countPosts };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async getListByMerchant(queryPostData: QueryPostData) {
    return await this.postRepository.getAndCountPosts(queryPostData);
  }

  public async getListByMerchantManager(queryData: ManagerPostSearchData) {
    return await this.postRepository.getPostsByOperationsOfManager(queryData);
  }

  public async getFullInfoPostByRefId({ refId, merchantId }: { refId: string; merchantId: string }): Promise<Post | null> {
    return await this.postRepository.findOne(
      { refId, merchantId },
      {
        relations: ['merchant', 'fiat', 'asset', 'paymentMethod', 'paymentMethod.paymentMethodFields'],
      }
    );
  }

  public async getFullInfoPostByManagerId({ refId, merchantManagerId }: { refId: string; merchantManagerId: string }): Promise<Post | null> {
    return await this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.merchant', 'merchant')
      .innerJoinAndSelect('post.asset', 'asset')
      .innerJoinAndSelect('post.fiat', 'fiat')
      .leftJoinAndSelect('post.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodFields')
      .where('post.refId = :refId', { refId })
      .andWhere('merchant.merchant_manager_id = :merchantManagerId', { merchantManagerId })
      .getOne();
  }

  public async closePost(postId: string, updatedBy: string) {
    return await this.postRepository.update(
      {
        id: postId,
        status: Not(PostStatus.CLOSE),
      },
      {
        status: PostStatus.CLOSE,
        updatedBy,
      }
    );
  }

  public async getListRecommendPrices () {
    return await this.postRepository.getListRecommendPrices();
  }

  public getKeyPriceAssets() {
    return `_cache_asset_price_`;
  }

  public async isPaymentMethodValid(paymentMethodId: string, masterDataCommon: MasterDataCommon) {
      const paymentMethod = await this.sharedPaymentMethodService.getPaymentMethodById(paymentMethodId);
      const bankName = paymentMethod?.paymentMethodFields.find(
        (item) => item.contentType === CONTENT_TYPE_BANK.BANK_NAME
      );

    const isSupportedBank = masterDataCommon.supportedBanks.includes(bankName?.value as SupportedBank);
    return isSupportedBank;
  }
}
