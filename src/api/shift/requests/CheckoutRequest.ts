import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { AssetBalanceRequest } from './AssetBalanceRequest';
import { ValidateError } from '@api/shift/errors/ValidateError';

export class CheckoutRequest {
  @IsNotEmpty({ context: ValidateError.ASSET_BALANCE_REQUIRED })
  @JSONSchema({ type: 'array', example: [{ assetId: '000d76dc-4b35-4b3c-8b40-440a8e394475', balance: 1234.5 }] })
  @Type(() => AssetBalanceRequest)
  public assetBalances: AssetBalanceRequest[];
}
