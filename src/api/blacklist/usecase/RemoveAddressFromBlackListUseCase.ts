import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { BlacklistService } from '@api/blacklist/services/BlacklistService';
import { BlackListResponseError } from '@api/blacklist/errors/BlackListResponseError';
import { IsolationLevel, Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class RemoveAddressFromBlackListUseCase {
  constructor(
    private blacklistService: BlacklistService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  public async removeAddress(blackListId: string) {
    this.log.debug(`Start implementing removeAddress from blacklist with id: ${blackListId}`);
    const blackListAddress = await this.blacklistService.getWalletFromBlacklist(blackListId);

    if (!blackListAddress) {
      return BlackListResponseError.WALLET_ADDRESS_IS_NOT_EXISTED_IN_BLACKLIST;
    }

    await this.blacklistService.removeWallet(blackListAddress.id);
    this.log.debug(`Stop implementing removeAddress from blacklist with id: ${blackListId}`);
    return null;
  }
}
