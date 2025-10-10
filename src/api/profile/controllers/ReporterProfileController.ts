import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { CurrentUser, Get, JsonController, QueryParams } from 'routing-controllers';
import { OperationInfoResponse } from '@api/profile/responses/OperationInfoResponse';
import { ReporterAuthorized } from '@api/auth/services/ReporterAuthorized';
import { FindAllMerchantsInWhitelistQueryRequest } from '../requests/FindAllMerchantsQueryRequest';
import { UserPassword } from '../models/UserPassword';
import { ManagerListInfoInReporterResponse } from '../responses/ManagerListInfoResponse';
import { GetListManagerUseCase } from '../usecases/admin/GetListManagerUseCase';
import { BaseUserInfoResponse } from '../responses/BaseUserInfoResponse';
import { SearchUserByWalletAddressUseCase } from '@api/profile/usecases/admin/SearchUserByWalletAddressUseCase';
import { SearchUserByWalletAddressRequest } from '@api/profile/requests/SearchUserByWalletAddressRequest';

@JsonController('/profile/reporter')
export class ReporterProfileController extends ControllerBase {
  constructor(
    private getListManagerUseCase: GetListManagerUseCase,
    private searchUserByWalletAddressUseCase: SearchUserByWalletAddressUseCase
  ) {
    super();
  }

  @Get('/get-info')
  @ReporterAuthorized()
  @Response(OperationInfoResponse)
  public async getInfo(@CurrentUser({ required: true }) currentUser: UserPassword) {
    return {
      ...currentUser,
      nickName: currentUser.username,
    };
  }

  @Get('/list-manager')
  @ReporterAuthorized()
  @PaginationResponse(ManagerListInfoInReporterResponse)
  public async findAllMerchantManagersInWhitelist(@QueryParams() query: FindAllMerchantsInWhitelistQueryRequest) {
    return await this.getListManagerUseCase.getManagers(query);
  }

  @Get('/search-user-by-address')
  @ReporterAuthorized()
  @Response(BaseUserInfoResponse)
  public async getUsersByWalletAddress(@QueryParams() query: SearchUserByWalletAddressRequest) {
    return await this.searchUserByWalletAddressUseCase.searchUsers(query.walletAddress);
  }
}
