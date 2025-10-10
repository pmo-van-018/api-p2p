import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ValidateError } from '@api/appeal/errors/ValidateError';

export class OpenAppealRequest {
  @IsNotEmpty({ context: ValidateError.ORDER_ID_REQUIRED })
  @IsString({ context: ValidateError.ORDER_ID_INVALID })
  @Length(20, 20, { context: ValidateError.ORDER_ID_INVALID })
  @Matches(/^[0-9]*$/, { context: ValidateError.ORDER_ID_INVALID })
  public orderId: string;
}
