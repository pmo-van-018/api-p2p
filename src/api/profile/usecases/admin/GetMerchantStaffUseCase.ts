import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { FindAllMerchantsInWhitelistQueryRequest } from '@api/profile/requests/FindAllMerchantsQueryRequest';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { OperationStatus, OperationType } from '@api/common/models';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';
import { MerchantType } from '@api/common/types';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class GetMerchantStaffUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedProfileService: SharedProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getStaffs(merchantManagerId: string, query: FindAllMerchantsInWhitelistQueryRequest) {
    this.log.debug(`Start implement getStaffs of manager ${merchantManagerId} with params: ${JSON.stringify(query)}`);
    const status = query.status
      ? (Helper.normalizeStringToArray(query.status, ',') as unknown as OperationStatus[])
      : [OperationStatus.ACTIVE, OperationStatus.INACTIVE];
    const types = (query.type
      ? Helper.normalizeStringToArray(query.type, ',')
      : [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER]
  ) as MerchantType[];
    const results = await this.adminProfileService.findAllMerchants({
      ...query,
        status,
      merchantManagerIds: merchantManagerId,
      types,
    });
    if (!results.items.length) {
      return results;
    }
    const fullFilledResults = await this.sharedProfileService.fullFillMerchantStatistic(results);
    this.log.debug(`Stop implement getStaffs of manager ${merchantManagerId} with params: ${JSON.stringify(query)}`);
    return fullFilledResults;
  }
}
