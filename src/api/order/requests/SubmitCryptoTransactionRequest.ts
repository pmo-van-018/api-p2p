import { IsNotEmpty, IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ValidateError } from '@api/order/errors/ValidateError';

export class SubmitCryptoTransactionRequest {
  @IsNotEmpty({
    context: ValidateError.ORDER_ID_IS_INVALID,
  })
  @IsString({
    context: ValidateError.ORDER_ID_IS_INVALID,
  })
  @Length(20, 20, {
    context: ValidateError.ORDER_ID_IS_INVALID,
  })
  @Matches(/^[0-9]*$/, {
    context: ValidateError.ORDER_ID_IS_INVALID,
  })
  public orderId: string;

  @IsNotEmpty({
    context: ValidateError.HASH_IS_INVALID,
  })
  public hash: string;

  @IsOptional()
  @IsBoolean()
  public isUpdate?: boolean;
}
