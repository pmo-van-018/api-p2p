import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  import { JSONSchema } from 'class-validator-jsonschema';
  
  import { MAX_LENGTH_NICKNAME, MIN_LENGTH_NICKNAME } from '@api/common/requests/constants';
  import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNickNameValid } from '@api/common/validations/IsNicknameValid';
import { UserError } from '../errors/UserError';
  
export class CreateNewSuperAdminBodyRequest {
    @IsNotEmpty()
    @IsString()
    @IsWalletAddress()
    @JSONSchema({ type: 'string', example: '0x7927DA51ABa1b5709cf0262ef2E30acF34D1aE89' })
    public walletAddress: string;
  
    @IsNotEmpty()
    @IsString()
    @IsNickNameValid({ context: UserError.NICKNAME_INVALID })
    @MinLength(MIN_LENGTH_NICKNAME)
    @MaxLength(MAX_LENGTH_NICKNAME)
    @JSONSchema({ type: 'string', example: 'abcxyz' })
    public nickName: string;
}
