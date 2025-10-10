import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { MerchantPaymentMethodService } from '@api/payment/services/MerchantPaymentMethodService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class CreatePaymentMethodByMerchantUseCase {
  constructor(
    private paymentMethodService: MerchantPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private operationService: SharedProfileService
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async createPaymentMethod(currentUser: Operation, paymentMethodCreateRequest: PaymentMethodCreateRequest) {
    await this.operationService.lockOperationPessimistic(currentUser.id);

    const numberPaymentMethodUser = await this.paymentMethodService.countOperationPaymentMethod(currentUser.id);

    const masterData = await this.masterDataService.getLatestMasterDataCommon();

    if (numberPaymentMethodUser >= masterData.managerPaymentMethodsLimit) {
      return PaymentMethodError.PAYMENT_METHOD_HAS_REACH_LIMIT;
    }

    // check if bank is supported
    const invalidBank = await this.masterDataService.isSupportedBank(paymentMethodCreateRequest.bankName);
    if (!invalidBank) {
      return PaymentMethodError.PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED;
    }

    // check duplicate payment method
    const duplicatedPaymentMethods = await this.paymentMethodService.getDuplicatedBankNumbers(currentUser.id, paymentMethodCreateRequest.bankNumber);
    if (duplicatedPaymentMethods.length) {
      const paymentMethodIds = duplicatedPaymentMethods.map((bank) => bank.id);
      const duplicatedBankName = await this.paymentMethodService.getDuplicatedBankName(paymentMethodIds, paymentMethodCreateRequest.bankName);
      if (duplicatedBankName) {
        return PaymentMethodError.PAYMENT_NUMBER_IS_EXIST;
      }
    }

    const paymentMethod = await this.paymentMethodService.createOperationPaymentMethod(currentUser.id, paymentMethodCreateRequest);
    return paymentMethod.id;
  }
}
