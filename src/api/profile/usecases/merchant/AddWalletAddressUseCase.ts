import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';
import moment from 'moment';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {Operation} from '@api/profile/models/Operation';
import {AddNewWalletAddressRequest} from '@api/profile/requests/AddNewWalletAddressRequest';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {UserProfileService} from '@api/profile/services/UserProfileService';

@Service()
export class AddWalletAddressUseCase {
  constructor(
    private walletAddressManagementService: WalletAddressManagementService,
    private sharedBlacklistService: SharedBlacklistService,
    private merchantProfileService: MerchantProfileService,
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async addWalletAddress(currentUser: Operation, data: AddNewWalletAddressRequest) {
    this.log.debug(
      `Start implement addNewWalletAddress for ${currentUser.type} ${currentUser.id} and walletAddress ${data.walletAddress}`
    );

    if (await this.sharedBlacklistService.isBlacklisted(data.walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }
    const isExist = await this.walletAddressManagementService.checkExist(data.walletAddress);
    if (isExist) {
      return OperationWalletError.WALLET_ADDRESS_IS_EXISTED;
    }
    const operation = await this.merchantProfileService.findOneByWallet(data.walletAddress);
    if (operation) {
      return OperationWalletError.WALLET_ADDRESS_IS_EXISTED;
    }
    const user = await this.userProfileService.findOneByWallet(data.walletAddress);
    if (user) {
      return OperationWalletError.WALLET_ADDRESS_IS_EXISTED;
    }
    await this.walletAddressManagementService.addNewWalletAddressByManager(currentUser.id, data.walletAddress);
    await this.merchantProfileService.updateStaff(currentUser.id, { updatedAt: moment.utc().toDate()});
    this.log.debug(`
      Stop implement addNewWalletAddress for ${currentUser.type} ${currentUser.id} and walletAddress ${data.walletAddress}
    `);
    return null;
  }
}
