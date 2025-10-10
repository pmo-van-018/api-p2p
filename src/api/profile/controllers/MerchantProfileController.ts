import {ControllerBase} from '@api/infrastructure/abstracts/ControllerBase';
import {User} from '@api/profile/models/User';
import {PaginationResponse, Response} from '@base/decorators/Response';
import {Body, CurrentUser, Delete, Get, JsonController, Params, Post, Put, QueryParams} from 'routing-controllers';
import {UserUpdateAvatarRequest} from '@api/profile/requests/Users/UserUpdateAvatarRequest';
import {UserUpdateAllowNotificationRequest} from '@api/profile/requests/Users/UserUpdateAllowNotificationRequest';
import {EmptyResponse} from '@api/common/responses/EmptyResponse';
import {UpdateAllowNotificationUseCase} from '@api/profile/usecases/merchant/UpdateAllowNotificationUseCase';
import {UpdateAvatarUseCase} from '@api/profile/usecases/merchant/UpdateAvatarUseCase';
import {GetProfileUseCase} from '@api/profile/usecases/merchant/GetProfileUseCase';
import {MerchantAuthorized} from '@api/auth/services/MerchantAuthorized';
import {MERCHANT_ROLE_TYPE} from '@api/common/models';
import {ListAvatarsBaseResponse} from '@api/profile/responses/ListAvatarsBaseResponse';
import {GetAvatarUsedUseCase} from '@api/profile/usecases/merchant/GetAvatarUsedUseCase';
import {StaffInfoBaseResponse} from '@api/profile/responses/StaffInfoBaseResponse';
import {Operation} from '@api/profile/models/Operation';
import {GetMerchantStaffRequest} from '@api/profile/requests/GetMerchantStaffRequest';
import {GetListStaffUseCase} from '@api/profile/usecases/merchant/GetListStaffUseCase';
import {CreateNewStaffRequest} from '@api/profile/requests/Merchants/CreateNewStaffRequest';
import {CreatedResponse} from '@api/common/responses/CreatedResponse';
import {CreateStaffUseCase} from '@api/profile/usecases/merchant/CreateStaffUseCase';
import {UpdateStaffBodyRequest} from '@api/profile/requests/Merchants/UpdateStaffBodyRequest';
import {UpdateStaffUseCase} from '@api/profile/usecases/merchant/UpdateStaffUseCase';
import {ActiveStaffUseCase} from '@api/profile/usecases/merchant/ActiveStaffUseCase';
import {InactiveStaffUseCase} from '@api/profile/usecases/merchant/InactiveStaffUseCase';
import {DeleteStaffUseCase} from '@api/profile/usecases/merchant/DeleteStaffUseCase';
import {ListSupporterBaseResponse} from '@api/profile/responses/ListSupporterBaseResponse';
import {GetListSupporterProcessingUseCase} from '@api/profile/usecases/merchant/GetListSupporterProcessingUseCase';
import {WalletAddressListResponse} from '@api/profile/responses/WalletAddressListResponse';
import {AddNewWalletAddressRequest} from '@api/profile/requests/AddNewWalletAddressRequest';
import {UUIDParamRequest} from '@api/common/requests/BaseRequest';
import {DeleteWalletAddressUseCase} from '@api/profile/usecases/merchant/DeleteWalletAddressUseCase';
import {AddWalletAddressUseCase} from '@api/profile/usecases/merchant/AddWalletAddressUseCase';
import {ActiveWalletAddressUseCase} from '@api/profile/usecases/merchant/ActiveWalletAddressUseCase';
import {GetListWalletAddressUseCase} from '@api/profile/usecases/merchant/GetListWalletAddressUseCase';
import {OperationInfoResponse} from '@api/profile/responses/OperationInfoResponse';
import {GetBalanceConfigurationUseCase} from '@api/profile/usecases/merchant/GetBalanceConfigurationUseCase';
import {BalanceConfigResponse} from '@api/profile/responses/BalanceConfigResponse';
import {CreateNewBalanceConfigRequest} from '@api/profile/requests/Merchants/CreateNewBalanceConfigRequest';
import {SetBalanceConfigUseCase} from '@api/profile/usecases/merchant/SetBalanceConfigUseCase';
import {StaffInfoResponse} from '@api/profile/responses/StaffInfoResponse';
import {GetStaffInfoUseCase} from '@api/profile/usecases/merchant/GetStaffInfoUseCase';
import { UseOperationRateLimitMiddleware } from '@api/middlewares/local/OperationRateLimitMiddleware';

@JsonController('/profile/merchant')
@MerchantAuthorized()
export class UserProfileController extends ControllerBase {
  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private updateAllowNotificationUseCase: UpdateAllowNotificationUseCase,
    private updateAvatarUseCase: UpdateAvatarUseCase,
    private getAvatarUsedUseCase: GetAvatarUsedUseCase,
    private getListStaffUseCase: GetListStaffUseCase,
    private getStaffInfoUseCase: GetStaffInfoUseCase,
    private createStaffUseCase: CreateStaffUseCase,
    private updateStaffUseCase: UpdateStaffUseCase,
    private activeStaffUseCase: ActiveStaffUseCase,
    private inactiveStaffUseCase: InactiveStaffUseCase,
    private deleteStaffUseCase: DeleteStaffUseCase,
    private getListSupporterProcessingUseCase: GetListSupporterProcessingUseCase,
    private addWalletAddressUseCase: AddWalletAddressUseCase,
    private activeWalletAddressUseCase: ActiveWalletAddressUseCase,
    private getListWalletAddressUseCase: GetListWalletAddressUseCase,
    private deleteWalletAddressUseCase: DeleteWalletAddressUseCase,
    private getBalanceConfigurationUseCase: GetBalanceConfigurationUseCase,
    private setBalanceConfigUseCase: SetBalanceConfigUseCase
  ) {
    super();
  }

  @Get('/')
  @MerchantAuthorized()
  @Response(OperationInfoResponse)
  public async getInfo(@CurrentUser({ required: true }) currentUser: User) {
    return await this.getProfileUseCase.getInfo(currentUser.id);
  }

  @Put('/update-allow-notification')
  @MerchantAuthorized()
  @Response(EmptyResponse)
  public async updateInfo(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() body: UserUpdateAllowNotificationRequest
  ) {
    return await this.updateAllowNotificationUseCase.updateAllowNotification(currentUser.id, body.allowNotification);
  }

  @Put('/update-avatar')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async updateAvatar(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() userUpdateAvatarRequest: UserUpdateAvatarRequest
  ) {
    return await this.updateAvatarUseCase.updateAvatar(currentUser.id, userUpdateAvatarRequest.avatar);
  }

  @Get('/list-used-avatars')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(ListAvatarsBaseResponse)
  public async findAvatarsUsed() {
    return await this.getAvatarUsedUseCase.getAvatarUsed();
  }

  @Get('/list-supporter-processing')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Response(ListSupporterBaseResponse)
  public async findAllSupporterProcessing(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getListSupporterProcessingUseCase.getSupporters(currentUser);
  }

  /**********************************************/
  /**
   * Merchant Manager manage MerchantOperator, MerchantSupporter
   */
  /**********************************************/

  @Get('/list-staff')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @PaginationResponse(StaffInfoBaseResponse)
  public async findAllStaffsOfCurrentUserInWhitelist(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() query: GetMerchantStaffRequest
  ) {
    return await this.getListStaffUseCase.getStaffs(currentUser.id, query);
  }

  @Get('/show-staff-info/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(StaffInfoResponse)
  public async findOneStaff(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.getStaffInfoUseCase.getInfo(currentUser, params.id);
  }

  @Post('/create-staff')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(CreatedResponse)
  public async createNewStaff(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: CreateNewStaffRequest
  ) {
    return await this.createStaffUseCase.createStaff(currentUser, body);
  }

  @UseOperationRateLimitMiddleware()
  @Put('/update-staff/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async updateStaffFromMerchantManager(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: UpdateStaffBodyRequest,
    @Params() params: UUIDParamRequest
  ) {
    return await this.updateStaffUseCase.updateStaff(currentUser, params.id, body);
  }

  @UseOperationRateLimitMiddleware()
  @Put('/active-staff/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async activeStaff(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.activeStaffUseCase.activeStaff(currentUser, params.id);
  }

  @UseOperationRateLimitMiddleware()
  @Put('/inactive-staff/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async inactiveStaff(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.inactiveStaffUseCase.inactiveStaff(currentUser, params.id);
  }

  @Delete('/delete-staff/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async deleteStaff(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.deleteStaffUseCase.deleteStaff(currentUser, params.id);
  }

  /**********************************************/
  /**
   * Merchant Manager manage wallet address
   */
  /**********************************************/

  @Get('/list-wallet-address')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(WalletAddressListResponse)
  public async getWalletAddressList(
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return this.getListWalletAddressUseCase.listWalletAddress(currentUser.id);
  }

  @Post('/add-wallet-address')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async addNewWalletAddress(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: AddNewWalletAddressRequest
  ) {
    return this.addWalletAddressUseCase.addWalletAddress(currentUser, body);
  }

  @Put('/active-wallet-address/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async activeWalletAddress(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return this.activeWalletAddressUseCase.activeWalletAddress(currentUser, params.id);
  }

  @Delete('/delete-wallet-address/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async deleteWalletAddressByManager(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return this.deleteWalletAddressUseCase.deleteWalletAddress(currentUser, params.id);
  }

  /**********************************************/
  /**
   * Merchant Manager manage balance configuration
   */
  /**********************************************/

  @Post('/set-balance-configuration')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(EmptyResponse)
  public async updateBalanceConfiguration(
    @Body() createNewBalanceConfigRequest: CreateNewBalanceConfigRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return this.setBalanceConfigUseCase.setBalanceConfiguration(
      createNewBalanceConfigRequest,
      currentUser
    );
  }

  @Get('/get-balance-configuration')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(BalanceConfigResponse)
  public async getBalanceConfiguration(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getBalanceConfigurationUseCase.getManagerBalanceConfig(currentUser);
  }
}
