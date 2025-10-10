import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { FindAdminSupporterRequest } from '@api/profile/requests/FindAdminSupporterRequest';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SharedAppealService} from '@api/appeal/services/SharedAppealService';
import {SharedSupportRequestService} from '@api/support-request/services/SharedSupportRequestService';

@Service()
export class GetListAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedAppealService: SharedAppealService,
    private sharedSupportRequestService: SharedSupportRequestService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getSupporters(query: FindAdminSupporterRequest) {
    this.log.debug(`Start implement getSupporters: ${JSON.stringify(query)}`);
    const [items, totalItems] = await this.adminProfileService.findAllAdminSupporters(query);
    let pickAppealCounts = [];
    let pickSupportRequestCounts = [];
    let formatItems = [];
    if (items.length) {
      const adminIds = items.map((e) => e.id);
      pickAppealCounts = await this.sharedAppealService.countAppealByAdmin(adminIds);
      pickSupportRequestCounts = await this.sharedSupportRequestService.countSupportRequestReceivedByAdminIds(adminIds);
      formatItems = items.map((adminSupporter) => {
        const appealCount = Number(
          pickAppealCounts.find((e) => e.adminSupporterId === adminSupporter.id)?.count || 0
        );
        const supportRequestCount = Number(
          pickSupportRequestCounts.find((e) => e.adminSupporterId === adminSupporter.id)?.count || 0
        );
        return {
          operation: adminSupporter,
          appealCount,
          supportRequestCount,
        };
      });
    }
    this.log.debug(`Stop implement getSupporters: ${JSON.stringify(query)}`);
    return {
      items: formatItems,
      totalItems,
    };
  }
}
