import { IsEquals } from '@api/common/validations/IsEquals';
import { UserError } from '@api/profile/errors/UserError';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class ChangePasswordRequest {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @JSONSchema({
    type: 'string',
    example: 'oldPassword',
  })
  public currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @JSONSchema({
    type: 'string',
    example: 'newPassword',
  })
  public newPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsEquals('newPassword', {
    context: UserError.CONFIRM_NEW_PASSWOR_IS_INCORRECT
  })
  @MinLength(8)
  @MaxLength(32)
  @JSONSchema({
    type: 'string',
    example: 'newPassword',
  })
  public confirmNewPassword: string;
}
