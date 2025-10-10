import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class Verify2FARequest {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  @IsString()
  @JSONSchema({
    type: 'string',
    example: '123456',
  })
  public code: string;
}
