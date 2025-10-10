import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { RedlockUtil } from '@base/utils/redlock';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { events } from '@api/subscribers/events';
import _groupBy from 'lodash/groupBy';
import { MerchantPaymentMethodService } from '@api/payment/services/MerchantPaymentMethodService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class DeletePaymentMethodByMerchantUseCase {
  constructor(
    private paymentMethodService: MerchantPaymentMethodService,
    private orderService: SharedOrderService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async deletePaymentMethod(currentUser: Operation, paymentMethodId: string) {
    return await RedlockUtil.lock(this.paymentMethodService.getKeyPaymentMethodLock(currentUser.id ), async () => {
      const paymentMethod = await this.paymentMethodService.getPaymentMethodById(currentUser.id, paymentMethodId);
      if (!paymentMethod) {
        return PaymentMethodError.PAYMENT_METHOD_NOT_FOUND;
      }

      const hasOrder = await this.orderService.hasOrderByPaymentMethod(paymentMethodId);

      if (hasOrder) {
        return PaymentMethodError.PAYMENT_METHOD_DELETION_IS_FAILED_WHEN_EXISTING_ORDER;
      }

      // offline post using this payment method
      const posts = await this.postService.getOnlinePostsByPaymentMethod(paymentMethodId);
      if (posts.length) {
        // offline posts
        const postIds = posts.map((post) => post.id);
        await this.postService.offlinePostByIds(postIds);
        // update merchant statistic
        const groupedPost = _groupBy(posts, 'merchantId');
        const merchantIds = Object.keys(groupedPost);
        merchantIds.map(async merchantId => {
          await this.statisticService.updatePostCount(merchantId, false, groupedPost[merchantId].length);
        });
        // clear recommend price cache
        await this.postService.delRecommendPriceCache(posts);
        // send notification to merchant operators
        this.eventDispatcher.dispatch(events.actions.operation.deletePaymentMethodByManager, posts);
      }
      // remove payment method in posts
      await this.postService.removePostPaymentMethod(paymentMethodId);

      // delete payment methods
      await this.paymentMethodService.deletePaymentMethod(paymentMethod.id);
      return true;
    });
  }
}
