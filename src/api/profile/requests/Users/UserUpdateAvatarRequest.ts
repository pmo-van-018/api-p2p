import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ValidateError } from '@api/profile/errors/ValidateError';

export class UserUpdateAvatarRequest {
  @IsOptional()
  @IsString({ context: ValidateError.AVATAR_INVALID })
  @MaxLength(64, { context: ValidateError.AVATAR_INVALID })
  public avatar: string | null;
}
