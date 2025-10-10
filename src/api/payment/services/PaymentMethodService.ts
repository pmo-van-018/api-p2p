/* eslint-disable @typescript-eslint/no-unused-vars */
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { PaymentMethodFieldRepository } from '@api/payment/repositories/PaymentMethodFieldRepository';
import { PaymentMethodRepository } from '@api/payment/repositories/PaymentMethodRepository';
import { PaymentMethodUpdateRequest } from '@api/payment/requests/PaymentMethodUpdateRequest';
import { In } from 'typeorm';
import { PaymentMethodType } from '@api/common/models';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';

@Service()
export class PaymentMethodService {
  constructor(
    @InjectRepository() protected paymentMethodRepository: PaymentMethodRepository,
    @InjectRepository() protected paymentMethodFieldRepository: PaymentMethodFieldRepository
  ) {}

  public async updatePaymentMethod(
    paymentMethod: PaymentMethod,
    paymentMethodUpdateRequest: PaymentMethodUpdateRequest
  ) {
    const paymentMethodFields = this.getPaymentMethodFields({
      paymentMethodId: paymentMethod.id,
      bankHolder: paymentMethodUpdateRequest.bankHolder,
      bankName: paymentMethodUpdateRequest.bankName,
      bankNumber: paymentMethodUpdateRequest.bankNumber,
      bankRemark: paymentMethodUpdateRequest?.bankRemark,
    });

    paymentMethod.paymentMethodFields = paymentMethod.paymentMethodFields.map((field) => {
      const existField = paymentMethodFields.find((item) => item.contentType === field.contentType);
      return this.paymentMethodFieldRepository.merge(field, existField);
    });
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  public async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.paymentMethodRepository.delete(paymentMethodId);
  }

  public async getDuplicatedBankName(paymentMethodIds: string[], bankName: string) {
    return await this.paymentMethodFieldRepository.findOne({
      where: {
        paymentMethodId: In(paymentMethodIds),
        contentType: CONTENT_TYPE_BANK.BANK_NAME,
        value: bankName,
      },
    });
  }

  public getKeyPaymentMethodLock(userId: string) {
    return `payment-method-${userId}`;
  }

  protected generateBankPaymentMethod(): PaymentMethod {
    const paymentMethod = new PaymentMethod();
    paymentMethod.type = PaymentMethodType.BANK;
    paymentMethod.methodName = 'Bank Transfer';
    paymentMethod.methodShortName = 'Bank Transfer';
    return paymentMethod;
  }

  protected async getOperationPaymentMethodById(operationId: string, id: string): Promise<PaymentMethod | undefined> {
    return await this.paymentMethodRepository.findOne({
      where: {
        operationId,
        id,
      },
      relations: ['paymentMethodFields'],
    });
  }

  protected async getUserPaymentMethodById(userId: string, id: string): Promise<PaymentMethod | undefined> {
    return await this.paymentMethodRepository.findOne({
      where: {
        userId,
        id,
      },
      relations: ['paymentMethodFields'],
    });
  }

  protected async insertPaymentMethodFields(paymentMethodId: string, paymentMethodCreateRequest: PaymentMethodCreateRequest) {
    const paymentMethodFields = this.paymentMethodFieldRepository.create(
      this.getPaymentMethodFields({
        paymentMethodId,
        bankHolder: paymentMethodCreateRequest.bankHolder,
        bankName: paymentMethodCreateRequest.bankName,
        bankNumber: paymentMethodCreateRequest.bankNumber,
        bankRemark: paymentMethodCreateRequest?.bankRemark || '',
      })
    );
    await this.paymentMethodFieldRepository.insert(paymentMethodFields);
  }

  private getPaymentMethodFields({
    paymentMethodId,
    bankHolder,
    bankNumber,
    bankName,
    bankRemark,
  }: {
    paymentMethodId: string;
    bankHolder: string;
    bankNumber: string;
    bankName: string;
    bankRemark: string;
  }) {
    return [
      {
        paymentMethodId,
        contentType: CONTENT_TYPE_BANK.BANK_HOLDER,
        name: 'Tên chủ tài khoản',
        value: bankHolder,
      },
      {
        paymentMethodId,
        contentType: CONTENT_TYPE_BANK.BANK_NUMBER,
        name: 'Tài khoản ngân hàng/Số thẻ',
        value: bankNumber,
      },
      {
        paymentMethodId,
        contentType: CONTENT_TYPE_BANK.BANK_NAME,
        name: 'Tên ngân hàng',
        value: bankName,
      },
      {
        paymentMethodId,
        contentType: CONTENT_TYPE_BANK.BANK_REMARK,
        name: 'Chi nhánh mở tài khoản',
        value: bankRemark,
      },
    ];
  }
}
