import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { RedlockUtil } from '@base/utils/redlock';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { UserPaymentMethodService } from '@api/payment/services/UserPaymentMethodService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class DeletePaymentMethodByUserUseCase {
  constructor(
    private paymentMethodService: UserPaymentMethodService,
    private orderService: SharedOrderService
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async deletePaymentMethod(currentUser: User, paymentMethodId: string) {
    return await RedlockUtil.lock(this.paymentMethodService.getKeyPaymentMethodLock(currentUser.id ), async () => {
      const paymentMethod = await this.paymentMethodService.getPaymentMethodById(currentUser.id, paymentMethodId);
      if (!paymentMethod) {
        return PaymentMethodError.PAYMENT_METHOD_NOT_FOUND;
      }

      const hasOrder = await this.orderService.hasOrderByPaymentMethod(paymentMethodId);

      if (hasOrder) {
        return PaymentMethodError.PAYMENT_METHOD_DELETION_IS_FAILED_WHEN_EXISTING_ORDER;
      }

      await this.paymentMethodService.deletePaymentMethod(paymentMethod.id);
      return true;
    });
  }
}
