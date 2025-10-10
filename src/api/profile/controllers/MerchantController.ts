import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { Get, JsonController, UseBefore } from 'routing-controllers';
import { verifyApiKey } from '@base/utils/verify-api-key.utils';
import { MerchantRefIdResponse } from '@api/statistic/responses/MerchantRefIdResponse';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@JsonController('/operation')
export class MerchantController extends ControllerBase {
  constructor(
    private operationManagementService: SharedProfileService
  ) {
    super();
  }

  @Get('/ref-id')
  @UseBefore(verifyApiKey)
  @Response(MerchantRefIdResponse)
  public async getOperationRefId() {
    return await this.operationManagementService.findAllMerchants({
      types: [OperationType.MERCHANT_MANAGER],
      status: [OperationStatus.ACTIVE, OperationStatus.INACTIVE],
    });
  }
}
