import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';

@Service()
export class GetListWalletAddressUseCase {
  constructor(
    private walletAddressManagementService: WalletAddressManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async listWalletAddress(merchantManagerId: string) {
    this.log.debug(
      `Start implement getListWalletAddressByMerchantManagerId for ${merchantManagerId}`
    );
    const walletAddresses = await this.walletAddressManagementService.getWalletAddressListByManagerId(merchantManagerId);

    this.log.debug(
      `Stop implement getListWalletAddressByMerchantManagerId for ${merchantManagerId}`
    );
    return walletAddresses;
  }
}
