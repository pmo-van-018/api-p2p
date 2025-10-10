import { WalletAddressManagement } from '@api/profile/models/WalletAddressManagement';
import { WalletAddressStatus } from '@api/common/models';

export class WalletAddressBaseIdResponse {
  public walletAddressId: string;

  constructor(walletAddressInfo: WalletAddressManagement) {
    this.walletAddressId = walletAddressInfo.id;
  }
}

export class WalletAddressInfoResponse extends WalletAddressBaseIdResponse {
  public walletAddress: string;
  public status: WalletAddressStatus;

  constructor(walletAddressInfo: WalletAddressManagement) {
    super(walletAddressInfo);
    this.walletAddress = walletAddressInfo.walletAddress;
    this.status = walletAddressInfo.status;
    this.walletAddressId = walletAddressInfo.id
  }
}
