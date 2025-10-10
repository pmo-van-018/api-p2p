import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class LoginPasswordRequest {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @JSONSchema({
    type: 'string',
    example: 'testuser123',
  })
  public username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @JSONSchema({
    type: 'string',
    example: 'password',
  })
  public password: string;
}
