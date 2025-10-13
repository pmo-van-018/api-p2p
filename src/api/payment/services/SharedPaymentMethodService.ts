import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PaymentMethodRepository } from '@api/payment/repositories/PaymentMethodRepository';
import { BankSyncService } from '@api/payment/services/BankSyncService';
import { BankBOCData } from '../types/PaymentMethod';

@Service()
export class SharedPaymentMethodService {
  constructor(
    private bankSyncService: BankSyncService,
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

  public async validateBOCSupportedBank(bankName: string) {
    const bocSupportedBanks = await this.bankSyncService.getBankData();
    const bankNames = bocSupportedBanks.map((bank) => bank.bank_name);
    return bankNames?.includes(bankName?.toLowerCase());
  }

  public async getBankCodeByBankName(bankName: string) {
   const bocSupportedBanks = await this.bankSyncService.getBankData();
   const bankMatched = bocSupportedBanks.find((bank: BankBOCData) => bank.bank_name === bankName);
   return bankMatched?.bank_code;
  }
}
