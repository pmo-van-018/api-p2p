import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { GetListUsersByAdminParamsRequest } from '@api/profile/requests/GetListUsersByAdminParamsRequest';
import {SearchType} from '@api/common/models';
import {validateWalletAddress} from '@base/utils/string.utils';
import {UserProfileService} from '@api/profile/services/UserProfileService';
import {PaginationResult} from "@api/common/types";
import {UserViewByAdmin} from "@api/profile/types/User";

@Service()
export class GetListUserUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getUsers(query: GetListUsersByAdminParamsRequest): Promise<PaginationResult<UserViewByAdmin>> {
    this.log.debug(`Start implement getUsers: ${JSON.stringify(query)}`);
    if (
      query.searchValue &&
      query.searchType === SearchType.WALLET_ADDRESS &&
      !validateWalletAddress(query.searchValue)
    ) {
      return {
        items: [],
        totalItems: 0,
      };
    }
    const users = await this.userProfileService.getListUsersByAdmin(query);
    this.log.debug(`Stop implement getUsers: ${JSON.stringify(query)}`);
    return {
      items: users[0],
      totalItems: users[1],
    };
  }
}
