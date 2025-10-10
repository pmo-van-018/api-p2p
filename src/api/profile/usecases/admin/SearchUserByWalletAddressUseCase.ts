import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {validateWalletAddress} from '@base/utils/string.utils';
import {UserProfileService} from '@api/profile/services/UserProfileService';

@Service()
export class SearchUserByWalletAddressUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async searchUsers(walletAddress: string) {
    this.log.debug(`Start implement SearchUserByWalletAddressUseCase: ${walletAddress}`);
    if (!validateWalletAddress(walletAddress)) {
      return null;
    }
    const user = await this.userProfileService.findOneByWallet(walletAddress);
    this.log.debug(`Start implement SearchUserByWalletAddressUseCase: ${walletAddress}`);
    return user;
  }
}
