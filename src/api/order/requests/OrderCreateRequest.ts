import { IsNotEmpty, IsPositive, IsString, Length, Matches } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { MaxFiat } from '@api/common/validations/Max';
import { ValidateError } from '@api/order/errors/ValidateError';

export class OrderCreateRequest {
  @IsNotEmpty({
    context: ValidateError.AMOUNT_IS_REQUIRED,
  })
  @JSONSchema({ type: 'number', example: 100 })
  @IsPositive({
    context: ValidateError.AMOUNT_IS_INVALID,
  })
  @MaxFiat({
    context: ValidateError.AMOUNT_IS_INVALID,
  })
  public totalPrice: number;

  @IsNotEmpty({
    context: ValidateError.POST_ID_IS_REQUIRED,
  })
  @IsString({
    context: ValidateError.POST_ID_IS_INVALID,
  })
  @Length(20, 20, {
    context: ValidateError.POST_ID_IS_INVALID,
  })
  @Matches(/^[0-9]*$/, {
    context: ValidateError.POST_ID_IS_INVALID,
  })
  @JSONSchema({ type: 'string', example: '1' })
  public postId: string;

  @IsNotEmpty({
    context: ValidateError.PRICE_IS_REQUIRED,
  })
  @IsPositive({
    context: ValidateError.PRICE_IS_INVALID,
  })
  @JSONSchema({ type: 'number', example: 1.123456 })
  public price: number;
}
