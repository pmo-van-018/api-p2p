import { JsonController, Get, Params } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { MerchantPublicStatisticResponse } from '@api/statistic/responses/merchant/MerchantPublicStatisticResponse';
import { GetMerchantPublicStatisticUseCase } from '@api/statistic/usecase/GetMerchantPublicStatisticUseCase';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';

@JsonController('/statistic')
export class StatisticController extends ControllerBase {
  constructor(
    private getMerchantPublicStatisticUseCase: GetMerchantPublicStatisticUseCase
  ) {
    super();
  }

  @Get('/get-merchant-public-statistic/:id')
  @Response(MerchantPublicStatisticResponse)
  public async getDashboardByOperationId(@Params() params: RefIDParamRequest) {
    return await this.getMerchantPublicStatisticUseCase.getPublicStatistic(params.id);
  }
}
