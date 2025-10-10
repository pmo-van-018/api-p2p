import { IsWalletAddress } from '@base/decorators/WalletAddress';
import { IsNotEmpty } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class AddNewWalletAddressRequest {
  @IsNotEmpty()
  @IsWalletAddress()
  @JSONSchema({ type: 'string', example: '0xd95a40bC01c645A450db877bD08FFF692558f111' })
  public walletAddress: string;
}
