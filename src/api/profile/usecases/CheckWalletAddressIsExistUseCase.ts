import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { P2PError } from '@api/common/errors/P2PError';
import { OperationError } from '@api/errors/OperationError';
import { BaseProfileService } from '@api/profile/services/BaseProfileService';
import { UserProfileService } from '@api/profile/services/UserProfileService';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';

@Service()
export class CheckWalletAddressIsExistUseCase {
  constructor(
    private profileService: BaseProfileService,
    private userProfileService: UserProfileService,
    private walletAddressManagementService: WalletAddressManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async isExist(walletAddress: string) {
    this.log.debug(`Start implement CheckWalletAddressIsExistUseCase: ${walletAddress}`);

    const operation = await this.profileService.getOperationByWalletAddress(walletAddress);
    if (operation) {
      throw new P2PError(OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED);
    }
    const user = await this.userProfileService.findOneByWallet(walletAddress);
    if (user) {
      throw new P2PError(OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED);
    }
    const walletManagement = await this.walletAddressManagementService.findWalletAddress(walletAddress);
    if (walletManagement) {
      throw new P2PError(OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED);
    }
    this.log.debug(`Stop implement CheckWalletAddressIsExistUseCase: walletAddress`);
    return !!(operation || user || walletManagement);
  }
}
