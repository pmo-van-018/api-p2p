import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { MasterDataResponse } from '@api/master-data/responses/MasterDataResponse';
import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { MasterDataCommonCreateRequest } from '@api/master-data/requests/Common/MasterDataCommonCreateRequest';
import { Response } from '@base/decorators/Response';
import { Body, CurrentUser, Get, JsonController, Post } from 'routing-controllers';
import { GetAdminSupporterSetting } from '@api/master-data/responses/GetAdminSupporterSetting';
import { GetSettingByAdminUseCase } from '@api/master-data/usecase/GetSettingByAdminUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { UpdateSettingByAdminUseCase } from '@api/master-data/usecase/UpdateSettingByAdminUseCase';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { GetSettingByAdminSupporterUseCase } from '@api/master-data/usecase/GetSettingByAdminSupporterUseCase';
import { UpdateMaintenanceByAdminUseCase } from '../usecase/UpdateMaintenanceByAdminUseCase';
import { DataMaintenanceRequest } from '../requests/Common/DataMaintenanceRequest';
import { GetPresignedUrlRequest } from '../requests/Common/GetPresignUrlRequest';
import { GetPresignedUrlUseCase } from '../usecase/GetPresignedUrlUseCase';

@JsonController('/master-data/admin')
export class AdminMasterDataController extends ControllerBase {
  constructor(
    private getSettingByAdminUseCase: GetSettingByAdminUseCase,
    private getSettingByAdminSupporterUseCase: GetSettingByAdminSupporterUseCase,
    private updateSettingByAdminUseCase: UpdateSettingByAdminUseCase,
    private updateMaintenanceByAdminUseCase: UpdateMaintenanceByAdminUseCase,
    private getPresignedUrlUseCase: GetPresignedUrlUseCase
  ) {
    super();
  }

  @Get('/get-settings')
  @Response(MasterDataResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
  public async getAllSettings() {
    return await this.getSettingByAdminUseCase.getSettings();
  }

  @Post('/update-settings')
  @Response(EmptyResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
  public async upsertNewMasterDataCommon(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body({ required: true }) masterDataCreateRequest: MasterDataCommonCreateRequest
  ) {
    return await this.updateSettingByAdminUseCase.updateSettings(currentUser, masterDataCreateRequest);
  }

  @Post('/update-maintenance')
  @Response(EmptyResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
  public async updateMaintenanceDataCommon(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body({ required: true }) dataMaintenanceRequest: DataMaintenanceRequest
  ) {
    return await this.updateMaintenanceByAdminUseCase.updateMaintenance(currentUser, dataMaintenanceRequest);
  }

  @Get('/get-settings-by-supporter')
  @Response(GetAdminSupporterSetting)
  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  public async getAppealReceiveLimit() {
    return await this.getSettingByAdminSupporterUseCase.getSettings();
  }

  @Post('/presigned-url')
  @Response(Object)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
  public async getPresignedUrl(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: GetPresignedUrlRequest
  ): Promise<any> {
    return await this.getPresignedUrlUseCase.getPresignedUrl(currentUser, body);
  }
}
