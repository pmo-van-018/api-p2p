import { IsArray, IsEnum, IsOptional  } from 'class-validator';
import { SupportedNetwork, SupportedWallet } from '@api/common/models/P2PEnum';
import { JSONSchema } from 'class-validator-jsonschema';
import { ConvertToUniqueArr } from '@api/common/transformer/ConvertToUniqueArr';
import { MasterDataError } from '@api/master-data/errors/MasterDataError';

export class DataMaintenanceRequest {
  @IsOptional()
  @IsArray()
  @IsEnum(SupportedWallet, {
    each: true,
    context: MasterDataError.WALLET_IS_INVALID
  })
  @JSONSchema({
    type: 'array',
    example: Object.keys(SupportedWallet).map((key) => SupportedWallet[key]),
  })
  @ConvertToUniqueArr()
  public walletMaintenance: SupportedWallet[];

  @IsOptional()
  @IsEnum(SupportedNetwork, {
    each: true,
    context: MasterDataError.NETWORK_IS_INVALID
  })
  @IsArray()
  @JSONSchema({ type: 'array', example: Object.keys(SupportedNetwork).map((key) => SupportedNetwork[key]) })
  @ConvertToUniqueArr()
  public networkMaintenance: SupportedNetwork[];
}
