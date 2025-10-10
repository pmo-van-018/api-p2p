import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SharedOrderService} from '@api/order/services/order/SharedOrderService';
import {UpdateManagerTransactionalUseCase} from '@api/profile/usecases/admin/UpdateManagerTransactionalUseCase';

@Service()
export class InactiveManagerUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedOrderService: SharedOrderService,
    private updateManagerTransactionalUseCase: UpdateManagerTransactionalUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async inactiveManager(managerId: string) {
    this.log.debug(`Start implement inactiveManager: ${managerId}`);
    const merchantManager = await this.adminProfileService.findOneById(managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const order = await this.sharedOrderService.getPendingOrderByOperation(managerId, OperationType.MERCHANT_MANAGER);
    if (order) {
      return OperationError.CANNOT_DISABLE_MANAGER_HAS_PENDING_ORDER;
    }
    await this.updateManagerTransactionalUseCase.updateMerchantManagerTransactional(merchantManager, { status: OperationStatus.INACTIVE });
    this.log.debug(`Stop implement inactiveManager: ${managerId}`);
    return null;
  }
}
