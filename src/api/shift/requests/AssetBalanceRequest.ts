import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { ValidateError } from '@api/shift/errors/ValidateError';

export class AssetBalanceRequest {
  @IsNotEmpty({ context: ValidateError.ASSET_ID_REQUIRED })
  @IsUUID(4, { context: ValidateError.ASSET_ID_INVALID })
  @JSONSchema({ type: 'string', example: '000d76dc-4b35-4b3c-8b40-440a8e394475' })
  public assetId: string;

  @IsNotEmpty({ context: ValidateError.BALANCE_REQUIRED })
  @IsNumber(null, { context: ValidateError.BALANCE_INVALID })
  @JSONSchema({ type: 'number', example: 1234.5 })
  public balance: number;
}
