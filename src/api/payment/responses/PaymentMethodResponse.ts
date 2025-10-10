import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';

export class PaymentMethodResponse {
  public paymentMethodId: string;
  public bankName: string;
  public bankNumber: string;
  public bankHolder: string;
  public bankRemark?: string;
  constructor(paymentMethod: PaymentMethod) {
    this.paymentMethodId = paymentMethod.id;
    this.bankName = paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME);
    this.bankNumber = paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER);
    this.bankHolder = paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER);
    this.bankRemark = paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_REMARK);
  }
}
