import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { SupportedBank } from '@api/common/models';
import { PaginationResult } from '@api/common/types';
import { PaymentMethod } from '@api/payment/types/PaymentMethod';
import { UserPaymentMethodService } from '@api/payment/services/UserPaymentMethodService';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@Service()
export class ListPaymentMethodByUserUseCase {
  constructor(
    private paymentMethodService: UserPaymentMethodService,
    private masterDataService: SharedMasterDataService
  ) {
  }
  public async listPaymentMethod(currentUser: User, pagination?: PaginationQueryRequest): Promise<PaginationResult<PaymentMethod>> {
    const [paymentMethods, total] = await this.paymentMethodService.getUserPaymentMethods(currentUser.id, pagination);

    if (!paymentMethods.length) {
      return {
        totalItems: 0,
        items: [],
      };
    }

    const supportedBanks = await this.masterDataService.getSupportedBanks();

    return {
      totalItems: total,
      items: paymentMethods.map(paymentMethod => {
        const bankName = paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME);
        return {
          id: paymentMethod.id,
          bankName,
          bankNumber: paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER),
          bankHolder: paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER),
          bankRemark: paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_REMARK),
          enable: supportedBanks.includes(bankName as SupportedBank),
        };
      }),
    };
  }
}
