import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PaymentMethodRepository } from '@api/payment/repositories/PaymentMethodRepository';

@Service()
export class SharedPaymentMethodService {
  constructor(
    @InjectRepository() private paymentMethodRepository: PaymentMethodRepository
  ) {}

  public async validatePaymentWithUser(paymentId: string, userId: string) {
    return !!(await this.paymentMethodRepository.findOne({
      where: {
        userId,
        id: paymentId,
      },
    }));
  }

  public async getPaymentMethodById(id: string) {
    return await this.paymentMethodRepository.getPaymentMethodById(id);
  }

  public async getPaymentMethodByIds(ids: string[]) {
    return await this.paymentMethodRepository.getPaymentMethodByIds(ids);
  }

  public async getPaymentMethodListWithBankName(bankNameList: string[]) {
    return await this.paymentMethodRepository.getPaymentMethodListWithBankName(bankNameList);
  }
}
