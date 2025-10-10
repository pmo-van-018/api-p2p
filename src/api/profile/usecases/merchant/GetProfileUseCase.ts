import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserError } from '@api/profile/errors/UserError';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';

@Service()
export class GetProfileUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getInfo(id: string) {
    this.log.debug(`Start implement getMerchantProfile with id: ${id}`);
    const user = await this.merchantProfileService.findOneById(id);
    if (!user) {
      return UserError.USER_NOT_FOUND;
    }
    this.log.debug(`Stop implement getMerchantProfile with id: ${id}`);
    return user;
  }
}
