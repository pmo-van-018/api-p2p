import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { PickEnum } from '@api/common/types';
import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '@api/profile/errors/UserError';

export class CreateNewStaffRequest {
  @IsNotEmpty()
  @IsString()
  @IsWalletAddress()
  public walletAddress: string;

  @IsNotEmpty()
  @IsEnum([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  public status: PickEnum<OperationStatus, OperationStatus.ACTIVE | OperationStatus.INACTIVE>;

  @IsOptional()
  @IsEnum([OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER])
  public type: OperationType;

  @IsNotEmpty()
  @IsString()
  @IsNickNameValid({ context: UserError.NICKNAME_INVALID })
  @MinLength(MIN_LENGTH_NICKNAME)
  @MaxLength(MAX_LENGTH_NICKNAME)
  public nickName: string;
}
