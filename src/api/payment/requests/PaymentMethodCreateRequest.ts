import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { SupportedBank } from '@api/common/models/P2PEnum';
import { ValidateError } from '@api/payment/errors/ValidateError';

export class PaymentMethodCreateRequest {
  @IsNotEmpty({ context: ValidateError.BANK_NUMBER_REQUIRED })
  @MaxLength(20, { context: ValidateError.BANK_NUMBER_MAX_LENGTH })
  @Matches(/^[A-Za-z0-9]*$/, { context: ValidateError.BANK_NUMBER_ALPHA_NUMERIC })
  public bankNumber?: string;

  @IsNotEmpty({ context: ValidateError.BANK_NAME_REQUIRED })
  @IsIn(Object.values(SupportedBank), { context: ValidateError.BANK_NAME_INVALID })
  public bankName: string;

  @IsNotEmpty({ context: ValidateError.BANK_HOLDER_REQUIRED })
  @MaxLength(32, { context: ValidateError.BANK_HOLDER_MAX_LENGTH })
  @Matches(/^[A-Za-z\s]*$/, { context: ValidateError.BANK_HOLDER_ALPHA })
  public bankHolder: string;

  @IsOptional()
  @MaxLength(32, { context: ValidateError.BANK_REMARK_MAX_LENGTH })
  @IsString( { context: ValidateError.BANK_REMARK_VI_ALPHA_NUMERIC_SPACES })
  public bankRemark?: string;
}
