import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNotEmpty } from 'class-validator';
import { ValidateError } from '@api/blacklist/errors/ValidateError';

export class AddWalletAddressRequest {
    @IsNotEmpty({ context: ValidateError.WALLET_ADDRESS_REQUIRED })
    @IsWalletAddress({ context: ValidateError.WALLET_ADDRESS_INVALID })
    public walletAddress: string;
}
