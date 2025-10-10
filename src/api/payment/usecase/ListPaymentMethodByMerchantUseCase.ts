import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { OperationType, SupportedBank } from '@api/common/models';
import { PaginationResult } from '@api/common/types';
import { PaymentMethod } from '@api/payment/types/PaymentMethod';
import { MerchantPaymentMethodService } from '@api/payment/services/MerchantPaymentMethodService';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@Service()
export class ListPaymentMethodByMerchantUseCase {
  constructor(
    private paymentMethodService: MerchantPaymentMethodService,
    private masterDataService: SharedMasterDataService
  ) {
  }
  public async listPaymentMethod(currentUser: Operation, paginationQueryRequest: PaginationQueryRequest): Promise<PaginationResult<PaymentMethod>> {
    const operationId = currentUser.type === OperationType.MERCHANT_MANAGER ? currentUser.id : currentUser.merchantManagerId;
    const pagination = currentUser.type === OperationType.MERCHANT_MANAGER ? paginationQueryRequest : null;
    const [paymentMethods, total] = await this.paymentMethodService.getOperationPaymentMethods(operationId, pagination);

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
