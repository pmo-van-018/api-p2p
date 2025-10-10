import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserByWalletAddressRequest {
  @IsNotEmpty()
  @IsString()
  public walletAddress: string;
}
