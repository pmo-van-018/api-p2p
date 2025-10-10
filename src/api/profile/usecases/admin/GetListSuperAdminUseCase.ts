import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import { FindSuperAdminRequest } from '@api/profile/requests/FindSuperAdminRequest';

@Service()
export class GetListSuperAdminUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getSuperAdmins(query: FindSuperAdminRequest) {
    this.log.debug(`Start implement getSuperAdmins: ${JSON.stringify(query)}`);
    const [items, totalItems] = await this.adminProfileService.findAllSuperAdmins(query);
    this.log.debug(`Stop implement getSuperAdmins: ${JSON.stringify(query)}`);
    return {
      items,
      totalItems,
    };
  }
}
