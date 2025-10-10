import {ADMIN_ROLE_TYPE} from '@api/common/models/P2PEnum';
import {SuccessResponse} from '@api/common/responses/SuccessResponse';
import {ControllerBase} from '@api/infrastructure/abstracts/ControllerBase';
import {CreateNewMerchantManagerBodyRequest} from '@api/profile/requests/CreateNewMerchantManagerBodyRequest';
import {FindAllMerchantsInWhitelistQueryRequest} from '@api/profile/requests/FindAllMerchantsQueryRequest';
import {UpdateMerchantManagerBodyRequest} from '@api/profile/requests/UpdateMerchantManagerBodyRequest';
import {MerchantManagerInfoResponse} from '@api/profile/responses/MerchantManagerInfoResponse';
import {StaffInfoResponse} from '@api/profile/responses/StaffInfoResponse';
import {PaginationResponse, Response} from '@base/decorators/Response';
import {
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers';
import {OperationInfoResponse} from '@api/profile/responses/OperationInfoResponse';
import {Operation} from '@api/profile/models/Operation';
import {GetListUsersByAdminParamsRequest} from '@api/profile/requests/GetListUsersByAdminParamsRequest';
import {UserInfoStatistic} from '@api/profile/responses/UserInfoListResponse';
import {CreateNewAdminSupporterBodyRequest} from '@api/profile/requests/CreateNewAdminSupporterBodyRequest';
import {UpdateAdminSupporterBodyRequest} from '@api/profile/requests/UpdateAdminSupporterBodyRequest';
import {FindAdminSupporterRequest} from '@api/profile/requests/FindAdminSupporterRequest';
import {UUIDParamRequest} from '@api/common/requests/BaseRequest';
import {SetGaslessRequest} from '@api/profile/requests/SetGaslessRequest';
import {EmptyResponse} from '@api/common/responses/EmptyResponse';
import {ActiveWalletAddressByAdminRequest} from '@api/profile/requests/ActiveWalletAddressByAdminRequest';
import {DeleteWalletAddressByAdminRequest} from '@api/profile/requests/DeleteWalletAddressByAdminRequest';
import {AddNewWalletAddressByAdminRequest} from '@api/profile/requests/AddNewWalletAddressByAdminRequest';
import {AdminAuthorized} from '@api/auth/services/AdminAuthorized';
import {GetProfileUseCase} from '@api/profile/usecases/admin/GetProfileUseCase';
import {UpdateAllowNotificationUseCase} from '@api/profile/usecases/admin/UpdateAllowNotificationUseCase';
import {GetListManagerUseCase} from '@api/profile/usecases/admin/GetListManagerUseCase';
import {GetMerchantStaffUseCase} from '@api/profile/usecases/admin/GetMerchantStaffUseCase';
import {GetMerchantProfileUseCase} from '@api/profile/usecases/admin/GetMerchantProfileUseCase';
import {CreateManagerUseCase} from '@api/profile/usecases/admin/CreateManagerUseCase';
import {UpdateManagerUseCase} from '@api/profile/usecases/admin/UpdateManagerUseCase';
import {ActiveManagerUseCase} from '@api/profile/usecases/admin/ActiveManagerUseCase';
import {InactiveManagerUseCase} from '@api/profile/usecases/admin/InactiveManagerUseCase';
import {DeleteManagerUseCase} from '@api/profile/usecases/admin/DeleteManagerUseCase';
import {SetManagerGaslessUseCase} from '@api/profile/usecases/admin/SetManagerGaslessUseCase';
import {GetListUserUseCase} from '@api/profile/usecases/admin/GetListUserUseCase';
import {GetListAdminSupporterUseCase} from '@api/profile/usecases/admin/GetListAdminSupporterUseCase';
import {CreateAdminSupporterUseCase} from '@api/profile/usecases/admin/CreateAdminSupporterUseCase';
import {UpdateAdminSupporterUseCase} from '@api/profile/usecases/admin/UpdateAdminSupporterUseCase';
import {ActiveAdminSupporterUseCase} from '@api/profile/usecases/admin/ActiveAdminSupporterUseCase';
import {InactiveAdminSupporterUseCase} from '@api/profile/usecases/admin/InactiveAdminSupporterUseCase';
import {DeleteAdminSupporterUseCase} from '@api/profile/usecases/admin/DeleteAdminSupporterUseCase';
import {AddWalletAddressUseCase} from '@api/profile/usecases/admin/AddWalletAddressUseCase';
import {ActiveWalletAddressUseCase} from '@api/profile/usecases/admin/ActiveWalletAddressUseCase';
import {DeleteWalletAddressUseCase} from '@api/profile/usecases/admin/DeleteWalletAddressUseCase';
import {CreatedResponse} from '@api/common/responses/CreatedResponse';
import {UserUpdateAllowNotificationRequest} from '@api/profile/requests/Users/UserUpdateAllowNotificationRequest';
import {ManagerListInfoResponse} from '@api/profile/responses/ManagerListInfoResponse';
import {AdminSupporterInfoResponse} from '@api/profile/responses/AdminSupporterInfoResponse';
import {BaseUserInfoResponse} from '@api/profile/responses/BaseUserInfoResponse';
import {SearchUserByWalletAddressUseCase} from '@api/profile/usecases/admin/SearchUserByWalletAddressUseCase';
import {SearchUserByWalletAddressRequest} from '@api/profile/requests/SearchUserByWalletAddressRequest';

@JsonController('/profile/admin')
export class AdminProfileController extends ControllerBase {
  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private updateAllowNotificationUseCase: UpdateAllowNotificationUseCase,
    private getListManagerUseCase: GetListManagerUseCase,
    private getMerchantStaffUseCase: GetMerchantStaffUseCase,
    private getMerchantProfileUseCase: GetMerchantProfileUseCase,
    private createManagerUseCase: CreateManagerUseCase,
    private updateManagerUseCase: UpdateManagerUseCase,
    private activeManagerUseCase: ActiveManagerUseCase,
    private inactiveManagerUseCase: InactiveManagerUseCase,
    private deleteManagerUseCase: DeleteManagerUseCase,
    private setManagerGaslessUseCase: SetManagerGaslessUseCase,
    private getListUserUseCase: GetListUserUseCase,
    private searchUserByWalletAddressUseCase: SearchUserByWalletAddressUseCase,
    private getListAdminSupporterUseCase: GetListAdminSupporterUseCase,
    private createAdminSupporterUseCase: CreateAdminSupporterUseCase,
    private updateAdminSupporterUseCase: UpdateAdminSupporterUseCase,
    private activeAdminSupporterUseCase: ActiveAdminSupporterUseCase,
    private inactiveAdminSupporterUseCase: InactiveAdminSupporterUseCase,
    private deleteAdminSupporterUseCase: DeleteAdminSupporterUseCase,
    private addWalletAddressUseCase: AddWalletAddressUseCase,
    private activeWalletAddressUseCase: ActiveWalletAddressUseCase,
    private deleteWalletAddressUseCase: DeleteWalletAddressUseCase
  ) {
    super();
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER, ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
  @Get('/get-info')
  @Response(OperationInfoResponse)
  public async getInfo(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getProfileUseCase.getProfile(currentUser);
  }

  @Put('/update-allow-notification')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Response(EmptyResponse)
  public async updateInfo(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: UserUpdateAllowNotificationRequest
  ) {
    return await this.updateAllowNotificationUseCase.updateAllowNotification(currentUser.id, body.allowNotification);
  }

  /**********************************************/
  /**
   * Super Admin manage Merchant
   */
  /**********************************************/

  @Get('/list-manager')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @PaginationResponse(ManagerListInfoResponse)
  public async findAllMerchantManagersInWhitelist(
    @QueryParams() query: FindAllMerchantsInWhitelistQueryRequest
  ) {
    return await this.getListManagerUseCase.getManagers(query);
  }

  @Get('/list-manager-staff/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @PaginationResponse(StaffInfoResponse)
  public async findAllStaffsByMerchantManagerIdInWhitelist(
    @QueryParams() query: FindAllMerchantsInWhitelistQueryRequest,
    @Params() params: UUIDParamRequest
  ) {
    // Due to business, get only staffs with status ACTIVE, and INACTIVE
    return await this.getMerchantStaffUseCase.getStaffs(params.id, query);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/get-manager-info/:id')
  @Response(MerchantManagerInfoResponse)
  public async findOneMerchantManager(@Params() params: UUIDParamRequest) {
    return await this.getMerchantProfileUseCase.getProfile(params.id);
  }

  @Post('/create-manager')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(CreatedResponse)
  public async createNewMerchantManager(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: CreateNewMerchantManagerBodyRequest
  ) {
    return await this.createManagerUseCase.createManager(body);
  }

  @Put('/update-manager/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async updateMerchantManagerFromAdmin(
    @Body() body: UpdateMerchantManagerBodyRequest,
    @Params() params: UUIDParamRequest
  ) {
    return await this.updateManagerUseCase.updateManager(params.id, body);
  }

  @Put('/active-manager/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async activeMerchantManagerFromAdmin(@Params() params: UUIDParamRequest) {
    return await this.activeManagerUseCase.activeManager(params.id);
  }

  @Put('/inactive-manager/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async inactiveMerchantManagerFromAdmin(@Params() params: UUIDParamRequest) {
    return await this.inactiveManagerUseCase.inactiveManager(params.id);
  }

  @Delete('/delete-manager/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async deleteOperationFromAdmin(
    @Params() params: UUIDParamRequest
  ) {
    return await this.deleteManagerUseCase.deleteManager(params.id);
  }

  @Put('/set-gasless-manager/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async settingGasless(
    @Params() params: UUIDParamRequest,
    @Body() body: SetGaslessRequest
  ) {
    return await this.setManagerGaslessUseCase.setGasless(params.id, body);
  }

  /**********************************************/
  /**
   * Super Admin manage End User
   */
  /**********************************************/

  @Get('/list-users')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @PaginationResponse(UserInfoStatistic)
  public async findAllUsersInWhitelist(@QueryParams() query: GetListUsersByAdminParamsRequest) {
    return await this.getListUserUseCase.getUsers(query);
  }

  @Get('/search-user-by-address')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(BaseUserInfoResponse)
  public async getUsersByWalletAddress(@QueryParams() query: SearchUserByWalletAddressRequest) {
    return await this.searchUserByWalletAddressUseCase.searchUsers(query.walletAddress);
  }

  /**********************************************/
  /**
   * Super Admin manage Admin Supporter
   */
  /**********************************************/

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/list-admin-supporter')
  @PaginationResponse(AdminSupporterInfoResponse)
  public async findAdminSupporters(@QueryParams() query: FindAdminSupporterRequest) {
    return await this.getListAdminSupporterUseCase.getSupporters(query);
  }

  @Post('/create-admin-supporter')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(CreatedResponse)
  public async createNewAdminSupporter(@Body() body: CreateNewAdminSupporterBodyRequest) {
    return await this.createAdminSupporterUseCase.createNewAdminSupporter(body);
  }

  @Put('/update-admin-supporter/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async updateAdminSupporterFromAdmin(
    @Body() body: UpdateAdminSupporterBodyRequest,
    @Params() params: UUIDParamRequest
  ) {
    return await this.updateAdminSupporterUseCase.updateAdminSupporter(params.id, body);
  }

  @Put('/active-admin-supporter/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async activeAdminSupporterFromAdmin(@Params() params: UUIDParamRequest) {
    return await this.activeAdminSupporterUseCase.activeAdminSupporter(params.id);
  }

  @Put('/inactive-admin-supporter/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async inactiveAdminSupporterFromAdmin(@Params() params: UUIDParamRequest) {
    return await this.inactiveAdminSupporterUseCase.inactiveAdminSupporter(params.id);
  }

  @Delete('/delete-admin-supporter/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(EmptyResponse)
  public async deleteAdminSupporterFromAdmin(
    @Params() params: UUIDParamRequest
  ) {
    return await this.deleteAdminSupporterUseCase.deleteAdminSupporter(params.id);
  }

  /**********************************************/
  /**
   * Super Admin manage Wallet address
   */
  /**********************************************/

  @Post('/add-wallet-address')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(SuccessResponse)
  public async addNewWalletAddressByAdmin(
    @Body() body: AddNewWalletAddressByAdminRequest
  ) {
    return this.addWalletAddressUseCase.addWalletAddress(body);
  }

  @Put('/active-wallet-address/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(SuccessResponse)
  public async activeWalletAddressByAdmin(
    @Body() body: ActiveWalletAddressByAdminRequest,
    @Params() params: UUIDParamRequest
  ) {
    return this.activeWalletAddressUseCase.activeWalletAddress(params.id, body);
  }

  @Put('/delete-wallet-address/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Response(SuccessResponse)
  public async deleteWalletAddressByAdmin(
    @Body() body: DeleteWalletAddressByAdminRequest,
    @Params() params: UUIDParamRequest
  ) {
    return this.deleteWalletAddressUseCase.deleteWalletAddress(params.id, body);
  }
}
