import { PaymentMethodType } from '../../../src/api/models/P2PEnum';
import { PaymentMethod } from '../../../src/api/models/PaymentMethod';
import { PaymentMethodField } from '../../../src/api/models/PaymentMethodField';
import {faker} from '@faker-js/faker';

export const paymentMethodData: PaymentMethod[] = [];
export const paymentMethodFieldData: PaymentMethodField[] = [];

export const mockPaymentMethodField = (paymentMethodId: number, contentType: string, name: string, value: string) => {
  const field = new PaymentMethodField();
  field.id = paymentMethodFieldData.length + 1;
  (field.contentType = contentType),
    (field.name = name),
    (field.value = value),
    (field.paymentMethodId = paymentMethodId);
  return field;
};

export const mockPaymentMethod = (userId: number) => {
  const paymentMethod = new PaymentMethod();
  paymentMethod.id = paymentMethodData.length + 1;
  paymentMethod.userId = userId;
  paymentMethod.methodName = 'Bank Transfer';
  paymentMethod.methodShortName = 'Bank Transfer';
  paymentMethod.type = PaymentMethodType.BANK;
  paymentMethod.paymentMethodFields = [];
  paymentMethod.paymentMethodFields.push(mockPaymentMethodField(paymentMethod.id, 'payee', 'Name', faker.name.fullName()));
  paymentMethod.paymentMethodFields.push(
    mockPaymentMethodField(paymentMethod.id, 'pay_account', 'Bank account number', '20893047')
  );
  paymentMethod.paymentMethodFields.push(mockPaymentMethodField(paymentMethod.id, 'bank', 'Bank name', 'Techcombank'));
  paymentMethodData.push(paymentMethod);
  return paymentMethod;
};
