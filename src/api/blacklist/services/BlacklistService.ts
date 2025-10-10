import { BlacklistRepository } from '@api/blacklist/repositories/BlacklistRepository';
import { GetBlacklistRequest } from '@api/blacklist/requests/GetBlacklistRequest';
import { plainToInstance } from 'class-transformer';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BLACKLIST_INSERTED_TYPE, BlacklistEntity } from '../models/BlacklistEntity';

@Service()
export class BlacklistService {
  constructor(
    @InjectRepository() private blacklistRepository: BlacklistRepository
  ) {}

  public async getBlackList(request: GetBlacklistRequest) {
    const { limit, page, search, type, orderDirection, orderField } = request;
    return await this.blacklistRepository.getBlacklistsAndCount({
      limit,
      page,
      search,
      type,
      orderDirection,
      orderField,
    });
  }

  public async getWalletFromBlacklist(blacklistId: string) {
    return this.blacklistRepository.findOne({
      where: {
        id: blacklistId,
      },
    });
  }

  public async removeWallet(blacklistId: string) {
    await this.blacklistRepository.delete({
      id: blacklistId,
    });
  }

  public async isBlacklisted(walletAddress: string) {
    const blacklist = await this.blacklistRepository.findOne({ walletAddress });
    return !!blacklist;
  }

  public async addAddressToBlacklist(walletAddress: string): Promise<void> {
    const newBlacklist = plainToInstance(BlacklistEntity, {
      walletAddress,
      type: BLACKLIST_INSERTED_TYPE.MANUAL,
    });
    await this.blacklistRepository.save(newBlacklist);
  }
}
