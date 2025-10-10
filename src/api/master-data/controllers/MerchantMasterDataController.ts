import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { MerchantOperatorSettingResponse } from '@api/master-data/responses/MerchantOperatorSettingResponse';
import { Response } from '@base/decorators/Response';
import { Get, JsonController } from 'routing-controllers';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { MerchantSupporterSettingResponse } from '@api/master-data/responses/MerchantSupporterSettingResponse';
import { GetSettingByMerchantUseCase } from '@api/master-data/usecase/GetSettingByMerchantUseCase';

@JsonController('/master-data/merchant')
export class MerchantMasterDataController extends ControllerBase {
  constructor(
    private getSettingByMerchantUseCase: GetSettingByMerchantUseCase
  ) {
    super();
  }

  @Get('/get-setting-by-operator')
  @Response(MerchantOperatorSettingResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR, MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async getSettingByOperator() {
    return await this.getSettingByMerchantUseCase.getSettings();
  }

  @Get('/get-setting-by-supporter')
  @Response(MerchantSupporterSettingResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_SUPPORTER])
  public async getSettingBySupporter() {
    return await this.getSettingByMerchantUseCase.getSettings();
  }
}
