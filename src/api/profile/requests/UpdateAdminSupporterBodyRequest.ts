import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
import { OperationStatus } from '@api/common/models';
import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '../errors/UserError';

export class UpdateAdminSupporterBodyRequest {
  @IsOptional()
  @IsString()
  @IsWalletAddress()
  public walletAddress?: string;

  @IsOptional()
  @IsString()
  @IsNickNameValid({ context: UserError.NICKNAME_INVALID })
  @MinLength(MIN_LENGTH_NICKNAME)
  @MaxLength(MAX_LENGTH_NICKNAME)
  @JSONSchema({ type: 'string', example: 'abcxyz' })
  public nickName?: string;

  @IsOptional()
  @IsEnum([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  @JSONSchema({ type: 'number', example: OperationStatus.ACTIVE })
  public status?: number;

}
