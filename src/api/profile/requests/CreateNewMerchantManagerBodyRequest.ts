import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { ValidateError } from '@api/common/errors/ValidateError';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '../errors/UserError';

export class CreateNewMerchantManagerBodyRequest {
  @IsNotEmpty()
  @IsString()
  @IsWalletAddress()
  public walletAddress: string;

  @IsNotEmpty()
  @IsString()
  @IsNickNameValid({ context: UserError.NICKNAME_INVALID })
  @MinLength(MIN_LENGTH_NICKNAME)
  @MaxLength(MAX_LENGTH_NICKNAME)
  public nickName: string;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  @IsBeforeDate('contractTo', {
    context: ValidateError.DATE_RANGE_IS_INVALID,
  })
  public contractFrom?: string;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  public contractTo?: string;
}
