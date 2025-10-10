import { WalletAddressManagement } from '@api/profile/models/WalletAddressManagement';
import { WalletAddressInfoResponse } from '@api/profile/responses/WalletAddressInfoResponse';

export class WalletAddressListResponse {
  public items: WalletAddressInfoResponse[];
  constructor(walletAddressList: WalletAddressManagement[]) {
      this.items = walletAddressList.map((wallet) => new WalletAddressInfoResponse(wallet));
  }
}
