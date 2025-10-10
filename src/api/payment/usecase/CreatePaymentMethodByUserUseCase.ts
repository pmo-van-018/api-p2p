import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { UserPaymentMethodService } from '@api/payment/services/UserPaymentMethodService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class CreatePaymentMethodByUserUseCase {
  constructor(
    private paymentMethodService: UserPaymentMethodService,
    private masterDataService: SharedMasterDataService,
    private sharedUserService: SharedProfileService
  ) {
  }
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async createPaymentMethod(currentUser: User, paymentMethodCreateRequest: PaymentMethodCreateRequest) {
    await this.sharedUserService.lockUserPessimistic(currentUser.id);

    const numberPaymentMethodUser = await this.paymentMethodService.countUserPaymentMethod(currentUser.id);

    const masterData = await this.masterDataService.getLatestMasterDataCommon();

    if (numberPaymentMethodUser >= masterData.userPaymentMethodsLimit) {
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

    const paymentMethod = await this.paymentMethodService.createUserPaymentMethod(currentUser.id, paymentMethodCreateRequest);
    return paymentMethod.id;
  }
}
