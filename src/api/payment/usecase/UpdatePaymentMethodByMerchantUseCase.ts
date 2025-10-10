import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { RedlockUtil } from '@base/utils/redlock';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PaymentMethodUpdateRequest } from '@api/payment/requests/PaymentMethodUpdateRequest';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { events } from '@api/subscribers/events';
import { SharedPostService } from '@api/post/services/SharedPostService';
import _groupBy from 'lodash/groupBy';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { OperationType } from '@api/common/models';
import { MerchantPaymentMethodService } from '@api/payment/services/MerchantPaymentMethodService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class UpdatePaymentMethodByMerchantUseCase {
  constructor(
    private paymentMethodService: MerchantPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private orderService: SharedOrderService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updatePaymentMethod(currentUser: Operation, paymentMethodUpdateRequest: PaymentMethodUpdateRequest) {
    return await RedlockUtil.lock(this.paymentMethodService.getKeyPaymentMethodLock(currentUser.id), async () => {
      let operationId = currentUser.id;
      if (currentUser.type === OperationType.MERCHANT_OPERATOR) {
        operationId = currentUser.merchantManagerId;
      }
      const paymentMethod = await this.paymentMethodService.getPaymentMethodById(operationId, paymentMethodUpdateRequest.id);
      if (!paymentMethod) {
        return PaymentMethodError.PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED;
      }

      if (paymentMethodUpdateRequest.bankNumber || paymentMethodUpdateRequest.bankName) {
        const paymentMethodChecker: Pick<PaymentMethodUpdateRequest, 'bankName' | 'bankNumber'> = {
          bankNumber: paymentMethodUpdateRequest.bankNumber
            || paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER),
          bankName: paymentMethodUpdateRequest.bankName
            || paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME),
        };
        const isValidBank = await this.masterDataService.isSupportedBank(paymentMethodChecker.bankName);
        if (!isValidBank) {
          return PaymentMethodError.PAYMENT_METHOD_NOT_FOUND;
        }

        // check duplicate payment method
        const duplicatedPaymentMethods = await this.paymentMethodService.getDuplicatedBankNumbers(currentUser.id, paymentMethodChecker.bankNumber);
        if (duplicatedPaymentMethods.length) {
          const paymentMethodIds = duplicatedPaymentMethods.map((bank) => bank.id);
          const duplicatedBankName = await this.paymentMethodService.getDuplicatedBankName(paymentMethodIds, paymentMethodChecker.bankName);
          if (duplicatedBankName) {
            return PaymentMethodError.PAYMENT_NUMBER_IS_EXIST;
          }
        }
      }

      if (await this.orderService.hasProcessingOrderByPaymentMethod(paymentMethodUpdateRequest.id)) {
        return PaymentMethodError.PAYMENT_METHOD_UPDATE_IS_FAILED_WHEN_EXISTING_ORDER;
      }

      await this.paymentMethodService.updatePaymentMethod(paymentMethod, paymentMethodUpdateRequest);

      // offline post using this payment method
      const posts = await this.postService.getOnlinePostsByPaymentMethod(paymentMethodUpdateRequest.id);
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
        this.eventDispatcher.dispatch(events.actions.operation.updatePaymentMethodByManager, posts);
      }
      return true;
    });
  }
}
