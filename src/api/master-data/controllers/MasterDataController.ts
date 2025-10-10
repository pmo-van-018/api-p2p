import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { SupportedBankResponse } from '@api/master-data/responses/Common/SupportedBanksResponse';
import { Response } from '@base/decorators/Response';
import { Authorized, Get, JsonController } from 'routing-controllers';
import { GetSupportedBanksUseCase } from '@api/master-data/usecase/GetSupportedBanksUseCase';
import { ResourceResponse } from '@api/master-data/responses/ResourceResponse';
import { GetResourceUseCase } from '@api/master-data/usecase/GetResourceUseCase';
import { ROLE_TYPE } from '@api/common/models';
import { GetResourceMaintenanceUseCase } from '../usecase/GetResourceMaintenanceUseCase';
import { MaintenanceResponse } from '../responses/Common/MaintenanceResponse';

@JsonController('/master-data')
export class MasterDataController extends ControllerBase {
  constructor(
    private getSupportedBanksUseCase: GetSupportedBanksUseCase,
    private getResourceUseCase: GetResourceUseCase,
    private getResourceMaintenanceUseCase: GetResourceMaintenanceUseCase,
  ) {
    super();
  }

  @Get('/list-supported-banks')
  @Response(SupportedBankResponse)
  @Authorized([ROLE_TYPE.USER, ROLE_TYPE.MERCHANT_MANAGER])
  public async getSupportedBank() {
    return await this.getSupportedBanksUseCase.getSupportedBanks();
  }

  @Get('/resource')
  @Response(ResourceResponse)
  public async getResource() {
    return await this.getResourceUseCase.getResource();
  }

  @Get('/maintenance')
  @Response(MaintenanceResponse)
  public async GetResourceMaintenance() {
    return await this.getResourceMaintenanceUseCase.getResourceMaintenance();
  }
}
