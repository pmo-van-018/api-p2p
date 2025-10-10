import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { AssetBalanceRequest } from './AssetBalanceRequest';
import { ValidateError } from '@api/shift/errors/ValidateError';

export class CheckInRequest {
  @IsNotEmpty({ context: ValidateError.ASSET_BALANCE_REQUIRED })
  @Type(() => AssetBalanceRequest)
  @JSONSchema({
    type: 'array',
    items: { type: 'object', properties: { assetId: { type: 'string' }, balance: { type: 'number' } } },
  })
  public assetBalances: AssetBalanceRequest[];
}
