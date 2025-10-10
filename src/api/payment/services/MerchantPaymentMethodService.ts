import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { PaymentMethodFieldRepository } from '@api/payment/repositories/PaymentMethodFieldRepository';
import { PaymentMethodRepository } from '@api/payment/repositories/PaymentMethodRepository';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';
import { PaymentMethodService } from '@api/payment/services/PaymentMethodService';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@Service()
export class MerchantPaymentMethodService extends PaymentMethodService {
  constructor(
    @InjectRepository() public paymentMethodRepository: PaymentMethodRepository,
    @InjectRepository() public paymentMethodFieldRepository: PaymentMethodFieldRepository
  ) {
    super(paymentMethodRepository, paymentMethodFieldRepository);
  }

  public async countOperationPaymentMethod(operationId: string) {
    return this.paymentMethodRepository.count({ operationId });
  }

  public async getOperationPaymentMethods(operationId: string, pagination?: PaginationQueryRequest) {
    return await this.paymentMethodRepository.getOperationPaymentMethods(operationId, pagination);
  }

  public async createPaymentMethod(operationId: string): Promise<PaymentMethod> {
    const paymentMethod = this.generateBankPaymentMethod();
    paymentMethod.operationId = operationId;
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  public async getPaymentMethodById(operationId: string, paymentMethodId: string): Promise<PaymentMethod | undefined> {
    return await this.getOperationPaymentMethodById(operationId, paymentMethodId);
  }

  public async createOperationPaymentMethod(
    operationId: string,
    paymentMethodCreateRequest: PaymentMethodCreateRequest
  ) {
    const newPaymentMethod = await this.createPaymentMethod(operationId);
    await this.insertPaymentMethodFields(newPaymentMethod.id, paymentMethodCreateRequest);
    return newPaymentMethod;
  }

  public async getDuplicatedBankNumbers(operationId: string, bankNumber: string) {
    return await this.paymentMethodRepository.getDuplicatedBankNumber({ operationId }, bankNumber);
  }

  public async getPaymentMethodAvailability (operationId: string, paymentMethodId: string) {
    return this.paymentMethodRepository.getOperationPaymentMethodById(operationId, paymentMethodId);
  }
}
