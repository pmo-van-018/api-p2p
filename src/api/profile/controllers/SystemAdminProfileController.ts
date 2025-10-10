import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { Body, CurrentUser, Delete, Get, JsonController, Params, Post, Put, QueryParams } from 'routing-controllers';
import { Operation } from '@api/profile/models/Operation';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { CreateSuperAdminUseCase } from '@api/profile/usecases/admin/CreateSuperAdminUseCase';
import { InactiveSuperAdminUseCase } from '@api/profile/usecases/admin/InactiveSuperAdminUseCase';
import { ActiveSuperAdminUseCase } from '@api/profile/usecases/admin/ActiveSuperAdminUseCase';
import { DeleteSuperAdminUseCase } from '@api/profile/usecases/admin/DeleteSuperAdminUseCase';
import { GetListSuperAdminUseCase } from '@api/profile/usecases/admin/GetListSuperAdminUseCase';
import { FindSuperAdminRequest } from '../requests/FindSuperAdminRequest';
import { SuperAdminInfoResponse } from '../responses/SuperAdminInfoResponse';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { CreatedResponse } from '@api/common/responses/CreatedResponse';
import { CreateNewSuperAdminBodyRequest } from '../requests/CreateNewSuperAdminBodyRequest';

@JsonController('/profile/system-admin')
@AdminAuthorized([ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
export class SystemAdminProfileController extends ControllerBase {
  constructor(
    private createSuperAdminUseCase: CreateSuperAdminUseCase,
    private inactiveSuperAdminUseCase: InactiveSuperAdminUseCase,
    private activeSuperAdminUseCase: ActiveSuperAdminUseCase,
    private deleteSuperAdminUseCase: DeleteSuperAdminUseCase,
    private getListSuperAdminUseCase: GetListSuperAdminUseCase
  ) {
    super();
  }

  @Post('/create-super-admin')
  @Response(CreatedResponse)
  public async createNewAdminSupporter(
    @Body() body: CreateNewSuperAdminBodyRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.createSuperAdminUseCase.createSuperAdmin(body, currentUser);
  }

  @Get('/list-super-admin')
  @PaginationResponse(SuperAdminInfoResponse)
  public async getSuperAdmins(@QueryParams() query: FindSuperAdminRequest) {
    return await this.getListSuperAdminUseCase.getSuperAdmins(query);
  }

  @Put('/inactive-super-admin/:id')
  @Response(EmptyResponse)
  public async inactiveSuperAdmin(@Params() params: UUIDParamRequest) {
    return await this.inactiveSuperAdminUseCase.inactiveSuperAdmin(params.id);
  }

  @Put('/active-super-admin/:id')
  @Response(EmptyResponse)
  public async activeSuperAdmin(@Params() params: UUIDParamRequest) {
    return await this.activeSuperAdminUseCase.activeSuperAdmin(params.id);
  }

  @Delete('/delete-super-admin/:id')
  @Response(EmptyResponse)
  public async deleteSuperAdmin(@Params() params: UUIDParamRequest) {
    return await this.deleteSuperAdminUseCase.deleteSuperAdmin(params.id);
  }
}
