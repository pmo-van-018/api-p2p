import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetListSupporterProcessingUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getSupporters(currentUser: Operation) {
    this.log.debug(
      `Start implement getListSupporterProcessing for ${currentUser.id}`
    );
    const supporters = await this.merchantProfileService.getAllSupporterProcessing(currentUser.merchantManagerId);

    this.log.debug(
      `Stop implement getListSupporterProcessing for ${currentUser.id}`
    );
    return supporters;
  }
}
