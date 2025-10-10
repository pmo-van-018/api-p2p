import { GetBlacklistRequest } from '@api/blacklist/requests/GetBlacklistRequest';
import { PaginationResult } from '@api/common/types';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { BlacklistEntity } from '@api/blacklist/models/BlacklistEntity';
import { BlacklistService } from '@api/blacklist/services/BlacklistService';

@Service()
export class GetBlacklistAddressUseCase {
  constructor(
    private blacklistService: BlacklistService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getBlacklist(request: GetBlacklistRequest): Promise<PaginationResult<BlacklistEntity>> {
    this.log.debug(`Start implementing searchBlacklist with params: ${JSON.stringify(request)}`);
    const { limit, page, search, type, orderDirection, orderField } = request;
    const [items, totalItems] = await this.blacklistService.getBlackList({
      limit,
      page,
      search,
      type,
      orderDirection,
      orderField,
    });
    this.log.debug(`Stop implementing searchBlacklist with params: ${JSON.stringify(request)}`);
    return {
      items,
      totalItems,
    };
  }
}
