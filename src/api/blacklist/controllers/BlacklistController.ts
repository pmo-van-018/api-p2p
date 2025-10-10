import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { GetBlacklistRequest } from '@api/blacklist/requests/GetBlacklistRequest';
import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { Body, Delete, Get, JsonController, Params, Post, QueryParams } from 'routing-controllers';
import { AddWalletAddressRequest } from '@api/blacklist/requests/AddWalletAddressRequest';
import { GetBlacklistAddressUseCase } from '@api/blacklist/usecase/GetBlacklistAddressUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { AddAddressToBlacklistUseCase } from '@api/blacklist/usecase/AddAddressToBlacklistUseCase';
import { BlacklistBaseResponse } from '@api/blacklist/responses/BlacklistBaseResponse';
import { RemoveAddressFromBlackListUseCase } from '@api/blacklist/usecase/RemoveAddressFromBlackListUseCase';

@JsonController('/blacklist/admin')
@AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
export class BlacklistController extends ControllerBase {
  constructor(
    private getBlacklistAddressUseCase: GetBlacklistAddressUseCase,
    private addAddressToBlacklistUseCase: AddAddressToBlacklistUseCase,
    private removeAddressFromBlackListUseCase: RemoveAddressFromBlackListUseCase
  ) {
    super();
  }

  @Get('')
  @PaginationResponse(BlacklistBaseResponse)
  public async getListBlackLists(@QueryParams() request: GetBlacklistRequest) {
    return await this.getBlacklistAddressUseCase.getBlacklist(request);
  }

  @Delete('/delete-address/:id')
  @Response(EmptyResponse)
  public async deleteBlackListAddress(@Params() params: UUIDParamRequest) {
    return await this.removeAddressFromBlackListUseCase.removeAddress(params.id);
  }

  @Post('/add-address')
  @Response(EmptyResponse)
  public async addAddressToBlacklist(@Body() addWalletAddressRequest: AddWalletAddressRequest) {
    return this.addAddressToBlacklistUseCase.addWalletAddress(addWalletAddressRequest);
  }
}
