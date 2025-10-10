import { BalanceConfigError } from '@api/profile/errors/BalanceConfigError';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { MAX_NUMBER, MIN_BALANCE_LIMIT } from '@api/common/models/P2PConstant';

class CreateNewBalanceConfig {
    @IsNotEmpty({ context: BalanceConfigError.ASSET_IS_REQUIRED })
    @IsUUID(4, {
        context: BalanceConfigError.ASSET_IS_INVALID,
    })
    @JSONSchema({ type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
    public assetId: string;

    @IsNotEmpty({ context: BalanceConfigError.BALANCE_LIMIT_IS_REQUIRED })
    @IsNumber({}, { context: BalanceConfigError.BALANCE_LIMIT_IS_INVALID })
    @Min(MIN_BALANCE_LIMIT, { context: BalanceConfigError.BALANCE_LIMIT_IS_INVALID })
    @Max(MAX_NUMBER, { context: BalanceConfigError.BALANCE_LIMIT_IS_INVALID })
    @JSONSchema({ type: 'number', example: 1000 })
    public balance: number;
}

export class CreateNewBalanceConfigRequest {
    @IsNotEmpty({
        context: BalanceConfigError.BALANCE_CONFIGS_REQUIRED,
        each: true,
    })
    @ValidateNested({
        each: true,
        context: BalanceConfigError.BALANCE_CONFIGS_INVALID,
    })
    @ArrayNotEmpty()
    @Type(() => CreateNewBalanceConfig)
    @JSONSchema({ type: 'array', example: [{ assetId: '123e4567-e89b-12d3-a456-426614174000', balance: 1000 }] })
    public balanceConfigs: CreateNewBalanceConfig[];
}
