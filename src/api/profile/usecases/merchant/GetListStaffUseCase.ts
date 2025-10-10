import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { MerchantType } from '@api/common/types';
import { Helper} from '@api/infrastructure/helpers/Helper';
import { OperationStatus, OperationType } from '@api/common/models';
import { GetMerchantStaffRequest } from '@api/profile/requests/GetMerchantStaffRequest';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class GetListStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private sharedProfileService: SharedProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getStaffs(merchantManagerId: string, query: GetMerchantStaffRequest) {
    this.log.debug(
      `Start implement findAllStaffsByMerchantManagerId for ${merchantManagerId} and query ${JSON.stringify(
        query
      )}`
    );
    const status = (
      query.status
        ? Helper.normalizeStringToArray(query.status, ',')
        : [OperationStatus.ACTIVE, OperationStatus.INACTIVE, OperationStatus.DELETED]
    ) as OperationStatus[];
    const types = (
      query.type
        ? Helper.normalizeStringToArray(query.type, ',')
        : [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER]
    ) as MerchantType[];
    const results = await this.merchantProfileService.findAllMerchants({
      ...query,
      status,
      merchantManagerIds: merchantManagerId,
      types,
    });

    const fullFilledResults = await this.sharedProfileService.fullFillMerchantStatistic(results);

    this.log.debug(
      `Stop implement findAllStaffsByMerchantManagerId for ${merchantManagerId} and query ${JSON.stringify(
        query
      )}`
    );
    return fullFilledResults;
  }
}
