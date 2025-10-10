import { IsNotEmpty, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { OrderCreateRequest } from './OrderCreateRequest';
import { ValidateError } from '@api/order/errors/ValidateError';

export class OrderSellCreateRequest extends OrderCreateRequest {
  @IsNotEmpty({
    context: ValidateError.PAYMENT_METHOD_ID_IS_REQUIRED,
  })
  @IsUUID(4, {
    context: ValidateError.PAYMENT_METHOD_ID_IS_INVALID,
  })
  @JSONSchema({ type: 'string', example: '1' })
  public paymentMethodId: string;
}
