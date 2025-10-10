import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';

@Service()
export class GetAvatarUsedUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getAvatarUsed() {
    this.log.debug(`Start implement getAvatarUsed`);
    const operations = await this.merchantProfileService.getOperationsUsingAvatar();
    this.log.debug(`Stop implement getAvatarUsed`);
    return operations;
  }
}
