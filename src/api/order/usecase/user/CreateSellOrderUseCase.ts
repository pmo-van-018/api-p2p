import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderSellCreateRequest} from '@api/order/requests/OrderSellCreateRequest';
import {User} from '@api/profile/models/User';
import {SharedProfileService} from '@api/profile/services/SharedProfileService';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {events} from '@api/subscribers/events';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {IsolationLevel, Transactional} from 'typeorm-transactional-cls-hooked';
import {Order, SELL_ORDER_STEP} from '@api/order/models/Order';
import {SupportedAsset, TradeType} from '@api/common/models';
import {OrderError} from '@api/order/errors/OrderError';
import {OrderData} from '@api/order/types/Order';
import {Helper} from '@api/infrastructure/helpers/Helper';
import {CRYPTO_PRECISION} from '@api/order/constants/order';
import {SharedPaymentMethodService} from '@api/payment/services/SharedPaymentMethodService';
import {SharedMasterDataService} from '@api/master-data/services/SharedMasterDataService';
import {UserOrderLifecycleService} from '@api/order/services/order/UserOrderLifecycleService';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {Post} from '@api/post/models/Post';
import {RedlockUtil} from '@base/utils/redlock';
import {MerchantError} from '@api/common/errors/MerchantError';

@Service()
export class CreateSellOrderUseCase {
  constructor(
    private sharedProfileService: SharedProfileService,
    private userOrderService: UserOrderLifecycleService,
    private sharedPaymentMethodService: SharedPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createOrder(currentUser: User, orderRequest: OrderSellCreateRequest) {
    this.log.debug('Start implement createSellOrder method for: ', currentUser.type, currentUser.walletAddress);
    return await RedlockUtil.lock(`user-${currentUser.id}-create-order`, async () => {
      const isUserOrderPending = await this.userOrderService.isUserPendingOrder(currentUser.id);
      if (isUserOrderPending) {
        return OrderLifeCycleError.USER_HAS_A_PENDING_SELL_ORDER;
      }
      if (!await this.sharedPaymentMethodService.validatePaymentWithUser(orderRequest.paymentMethodId, currentUser.id)) {
        return OrderLifeCycleError.PAYMENT_METHOD_NOT_FOUND;
      }
      const post = await this.postService.findOneWithLock(orderRequest.postId, TradeType.BUY);
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
      if (
        !masterDataCommon.assetNetworkTypes.includes(
          SupportedAsset[`${post.asset.name}_${post.asset.network}`.toUpperCase()]
        )
      ) {
        return OrderError.TOKEN_IS_NO_LONGER_SUPPORTED;
      }
      const benchmarkPrice = await this.userOrderService.crawlBenchmarkPrice({
        assetname: post.asset.name,
        tradeType: TradeType.SELL,
      });

      const orderData: OrderData = {
        assetId: post.assetId,
        fiatId: post.fiatId,
        postId: post.id,
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
      this.eventDispatcher.dispatch(events.actions.order.sell.userCreateOrder, order);
      this.log.debug('Stop implement createSellOrder method for: ', currentUser.type, currentUser.walletAddress);
      return refId;
    });
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  private async createOrderTransactional(orderData: OrderData, orderRequest: OrderSellCreateRequest, post: Post) {
    const newOrder = await this.userOrderService.createSellOrder(orderRequest, orderData);
    await this.postService.updateBlockAmount(post, Helper.round(newOrder.amount, CRYPTO_PRECISION, 'ceil'));
    await this.statisticService.updateOrderStatistic(
      { ...newOrder, step: null } as Order,
      SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER
    );

    return newOrder.refId;
  }
}
