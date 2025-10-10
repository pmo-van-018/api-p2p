import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';
import moment from 'moment';
import { OperationWalletError } from '@api/profile/errors/OperationWallet';
import { Operation } from '@api/profile/models/Operation';
import { SharedBlacklistService } from '@api/blacklist/services/SharedBlacklistService';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { WalletAddressStatus } from '@api/common/models';

@Service()
export class DeleteWalletAddressUseCase {
  constructor(
    private walletAddressManagementService: WalletAddressManagementService,
    private merchantProfileService: MerchantProfileService,
    private sharedBlacklistService: SharedBlacklistService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteWalletAddress(currentUser: Operation, walletAddressId: string) {
    this.log.debug(`
      Start implement deleteWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    const countWalletAddressOfManager = await this.walletAddressManagementService.countWalletAddressByManager(currentUser.id);
    if (countWalletAddressOfManager <= 1) {
      return OperationWalletError.WALLET_ADDRESS_CANNOT_EMPTY;
    }
    const walletAddressInfo = await this.walletAddressManagementService.getOneByIdAndManagerId(walletAddressId, currentUser.id);
    if (!walletAddressInfo) {
      return OperationWalletError.WALLET_ADDRESS_NOT_FOUND;
    }
    if (
      walletAddressInfo.status === WalletAddressStatus.ACTIVE ||
      walletAddressInfo.walletAddress === currentUser.walletAddress
    ) {
      return OperationWalletError.WALLET_ADDRESS_HAS_ACTIVED;
    }
    if (await this.sharedBlacklistService.isBlacklisted(walletAddressInfo.walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }
    await this.walletAddressManagementService.softDelete(walletAddressInfo.id);
    await this.merchantProfileService.updateStaff(currentUser.id, { updatedAt: moment.utc().toDate()});
    this.log.debug(`
      Stop implement deleteWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    return null;
  }
}
