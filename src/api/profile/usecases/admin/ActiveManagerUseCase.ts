import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationError} from '@api/errors/OperationError';
import {OperationStatus, OperationType} from '@api/common/models';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {UpdateManagerTransactionalUseCase} from '@api/profile/usecases/admin/UpdateManagerTransactionalUseCase';

@Service()
export class ActiveManagerUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private updateManagerTransactionalUseCase: UpdateManagerTransactionalUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async activeManager(managerId: string) {
    this.log.debug(`Start implement activeManager: ${managerId}`);
    const merchantManager = await this.adminProfileService.findOneById(managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    await this.updateManagerTransactionalUseCase.updateMerchantManagerTransactional(merchantManager, { status: OperationStatus.ACTIVE});
    this.log.debug(`Stop implement activeManager: ${managerId}`);
    return null;
  }
}
