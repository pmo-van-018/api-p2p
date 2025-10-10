import { BlackListResponseError } from '@api/blacklist/errors/BlackListResponseError';
import { BlacklistRepository } from '@api/blacklist/repositories/BlacklistRepository';
import { P2PError } from '@api/common/errors/P2PError';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SharedBlacklistService {
  constructor(
    @InjectRepository() private blacklistRepository: BlacklistRepository
  ) {}

  public async validateWalletAddressInBlacklist(walletAddress: string): Promise<void> {
    const blacklistAddress = await this.blacklistRepository.findOne({
      where: {
        walletAddress,
      },
    });

    if (blacklistAddress) {
      throw new P2PError(BlackListResponseError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST);
    }
  }

  public async isBlacklisted(walletAddress: string) {
    const blacklist = await this.blacklistRepository.findOne({ walletAddress });
    return !!blacklist;
  }
}
