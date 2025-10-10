import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {User} from '@api/profile/models/User';
import {SharedProfileService} from '@api/profile/services/SharedProfileService';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {events} from '@api/subscribers/events';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {IsolationLevel, Transactional} from 'typeorm-transactional-cls-hooked';
import {Order} from '@api/order/models/Order';
import {SupportedAsset, TradeType} from '@api/common/models';
import {OrderError} from '@api/order/errors/OrderError';
import {OrderData} from '@api/order/types/Order';
import {Helper} from '@api/infrastructure/helpers/Helper';
import {CRYPTO_PRECISION} from '@api/order/constants/order';
import {SharedMasterDataService} from '@api/master-data/services/SharedMasterDataService';
import {UserOrderLifecycleService} from '@api/order/services/order/UserOrderLifecycleService';
import {PostError} from '@api/post/errors/PostError';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {Post} from '@api/post/models/Post';
import {MerchantError} from '@api/common/errors/MerchantError';
import {OrderCreateRequest} from '@api/order/requests/OrderCreateRequest';
import {RedlockUtil} from '@base/utils/redlock';

@Service()
export class CreateBuyOrderUseCase {
  constructor(
    private sharedProfileService: SharedProfileService,
    private userOrderService: UserOrderLifecycleService,
    private masterDataService: SharedMasterDataService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createOrder(currentUser: User, orderRequest: OrderCreateRequest) {
    this.log.debug('Start implement createBuyOrder method for: ', currentUser.type, currentUser.walletAddress);
    return await RedlockUtil.lock(`user-${currentUser.id}-create-order`, async () => {
      const isUserOrderPending = await this.userOrderService.isUserPendingOrder(currentUser.id);
      if (isUserOrderPending) {
        return OrderLifeCycleError.USER_HAS_A_PENDING_SELL_ORDER;
      }
      const post = await this.postService.findOneWithLock(orderRequest.postId, TradeType.SELL);
      if (!post) {
        return PostError.MERCHANT_BUY_POST_IS_UNAVAILABLE;
      }
      const validateError = this.userOrderService.validateOrderRequest(orderRequest, post, currentUser.walletAddress);
      if (validateError) {
        return validateError;
      }

      const existMerchant =
        post.merchant && !this.sharedProfileService.isUserBlocked(post.merchant) && !this.sharedProfileService.isUserDeleted(post.merchant);
      if (!existMerchant) {
        return MerchantError.MERCHANT_NOT_FOUND;
      }
      const masterDataCommon = await this.masterDataService.getLatestMasterDataCommon();

      if (!masterDataCommon.assetNetworkTypes.includes(SupportedAsset[`${post.asset.name}_${post.asset.network}`.toUpperCase()])) {
        return OrderError.TOKEN_IS_NO_LONGER_SUPPORTED;
      }

      const benchmarkPrice = await this.userOrderService.crawlBenchmarkPrice({
        assetname: post.asset.name,
        tradeType: TradeType.BUY,
      });

      const orderData: OrderData = {
        assetId: post.assetId,
        fiatId: post.fiatId,
        postId: post.id,
        paymentMethodId: post.paymentMethodId,
        merchantId: post.merchantId,
        paymentTimeLimit: post.paymentTimeLimit,
        userId: currentUser.id,
        fee: masterDataCommon.fee,
        penaltyFee: masterDataCommon.penaltyFee,
        assetPrecision: post.asset.precision,
        userPeerChatId: currentUser.peerChatId,
        merchantPeerChatId: post.merchant.peerChatId,
        configuration: this.userOrderService.getOrderConfiguration(masterDataCommon),
        benchmarkPrice: post.benchmarkPrice,
        benchmarkPercent: post.benchmarkPercent,
        benchmarkPriceAtCreated: benchmarkPrice,
      };

      const refId = await this.createOrderTransactional(orderData, orderRequest, post);
      const order = await this.userOrderService.getFullInfoByRefId(refId);
      this.eventDispatcher.dispatch(events.actions.order.buy.userCreateBuyOrder, order);
      this.log.debug('Stop implement createBuyOrder method for: ', currentUser.type, currentUser.walletAddress);
      return refId;
    });
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  private async createOrderTransactional(orderData: OrderData, orderRequest: OrderCreateRequest, post: Post) {
    await this.postService.updateBlockAmount(
      post,
      Helper.round(
        Helper.computeAmountBuyOrder(orderRequest.totalPrice, orderRequest.price, CRYPTO_PRECISION),
        CRYPTO_PRECISION,
        'floor'
      )
    );
    const newOrder = await this.userOrderService.createBuyOrder(orderRequest, orderData);
    await this.statisticService.updateOrderStatistic({ ...newOrder, step: null } as Order, newOrder.step);

    return newOrder.refId;
  }
}
