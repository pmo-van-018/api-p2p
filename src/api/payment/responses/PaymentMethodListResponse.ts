import { PaymentMethod } from '@api/payment/types/PaymentMethod';
import { maskBank } from '@base/utils/string.utils';

export class PaymentMethodListResponse {
  public id: string;
  public bankName: string;
  public bankNumber: string;
  public bankHolder: string;
  public bankRemark?: string;
  public enable: boolean;
  constructor(paymentMethod: PaymentMethod) {
    this.id = paymentMethod.id;
    this.bankName = paymentMethod.bankName;
    this.bankNumber = paymentMethod.bankNumber;
    this.bankHolder = paymentMethod.bankHolder;
    this.bankRemark = paymentMethod.bankRemark;
    this.enable = paymentMethod.enable;
  }
}

export class UserPaymentMethodListResponse extends PaymentMethodListResponse {
  constructor(paymentMethod: PaymentMethod) {
    super(paymentMethod);
    this.bankNumber = maskBank(paymentMethod.bankNumber);
  }
}
