import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OperationStatus } from '@api/common/models/P2PEnum';
import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '@api/profile/errors/UserError';

export class UpdateStaffBodyRequest {
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
  @IsEnum([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  public status?: number;
}
