import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { PaymentMethodFieldRepository } from '@api/payment/repositories/PaymentMethodFieldRepository';
import { PaymentMethodRepository } from '@api/payment/repositories/PaymentMethodRepository';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';
import { PaymentMethodService } from '@api/payment/services/PaymentMethodService';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@Service()
export class UserPaymentMethodService extends PaymentMethodService {
  constructor(
    @InjectRepository() public paymentMethodRepository: PaymentMethodRepository,
    @InjectRepository() public paymentMethodFieldRepository: PaymentMethodFieldRepository
  ) {
    super(paymentMethodRepository, paymentMethodFieldRepository);
  }

  public async countUserPaymentMethod(userId: string) {
    return this.paymentMethodRepository.count({ userId });
  }

  public async getUserPaymentMethods(userId: string, pagination?: PaginationQueryRequest) {
    return await this.paymentMethodRepository.getUserPaymentMethods(userId, pagination);
  }

  public async createPaymentMethod(userId: string): Promise<PaymentMethod> {
    const paymentMethod = this.generateBankPaymentMethod();
    paymentMethod.userId = userId;
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  public async getPaymentMethodById(userId: string, paymentMethodId: string): Promise<PaymentMethod | undefined> {
    return await this.getUserPaymentMethodById(userId, paymentMethodId);
  }

  public async createUserPaymentMethod(
    userId: string,
    paymentMethodCreateRequest: PaymentMethodCreateRequest
  ) {
    const newPaymentMethod = await this.createPaymentMethod(userId);
    await this.insertPaymentMethodFields(newPaymentMethod.id, paymentMethodCreateRequest);
    return newPaymentMethod;
  }

  public async getDuplicatedBankNumbers(userId: string, bankNumber: string) {
    return await this.paymentMethodRepository.getDuplicatedBankNumber({ userId }, bankNumber);
  }
}
