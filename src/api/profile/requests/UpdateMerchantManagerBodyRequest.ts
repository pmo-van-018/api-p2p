import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MAX_MERCHANT_LEVEL, MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { OperationStatus } from '@api/common/models/P2PEnum';
import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { ValidateError } from '@api/common/errors/ValidateError';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '../errors/UserError';

export class UpdateMerchantManagerBodyRequest {
  @IsNotEmpty()
  @IsUUID(4)
  public id: string;

  @IsOptional()
  @IsString()
  @IsWalletAddress()
  public walletAddress?: string;

  @IsOptional()
  @IsString()
  @IsNickNameValid({ context: UserError.NICKNAME_INVALID })
  @MinLength(MIN_LENGTH_NICKNAME)
  @MaxLength(MAX_LENGTH_NICKNAME)
  public nickName?: string;

  @IsOptional()
  @IsPositive()
  @Min(MIN_MERCHANT_LEVEL)
  @Max(MAX_MERCHANT_LEVEL)
  public merchantLevel?: number;

  @IsOptional()
  @IsEnum([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  public status?: number;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  @IsBeforeDate('contractTo', {
    message: '',
    context: ValidateError.DATE_IS_INVALID,
  })
  public contractFrom?: string;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  public contractTo?: string;
}
