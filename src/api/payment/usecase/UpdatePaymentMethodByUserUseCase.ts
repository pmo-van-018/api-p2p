import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { RedlockUtil } from '@base/utils/redlock';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PaymentMethodUpdateRequest } from '@api/payment/requests/PaymentMethodUpdateRequest';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { UserPaymentMethodService } from '@api/payment/services/UserPaymentMethodService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class UpdatePaymentMethodByUserUseCase {
  constructor(
    private paymentMethodService: UserPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private orderService: SharedOrderService
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updatePaymentMethod(currentUser: User, paymentMethodUpdateRequest: PaymentMethodUpdateRequest) {
    return await RedlockUtil.lock(this.paymentMethodService.getKeyPaymentMethodLock(currentUser.id ), async () => {
      const paymentMethod = await this.paymentMethodService.getPaymentMethodById(currentUser.id, paymentMethodUpdateRequest.id);
      if (!paymentMethod) {
        return PaymentMethodError.PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED;
      }

      if (await this.orderService.hasProcessingOrderByPaymentMethod(paymentMethodUpdateRequest.id)) {
        return PaymentMethodError.PAYMENT_METHOD_UPDATE_IS_FAILED_WHEN_EXISTING_ORDER;
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

      await this.paymentMethodService.updatePaymentMethod(paymentMethod, paymentMethodUpdateRequest);
      return true;
    });
  }
}
