import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { OperationError } from '@api/errors/OperationError';
import { Operation } from '@api/profile/models/Operation';
import { OperationStatus } from '@api/common/models';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { UpdateStaffTransactionUseCase } from '@api/profile/usecases/merchant/UpdateStaffTransactionUseCase';

@Service()
export class InactiveStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private sharedOrderService: SharedOrderService,
    private updateStaffTransactionUseCase: UpdateStaffTransactionUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async inactiveStaff(currentUser: Operation, staffId: string) {
    this.log.debug(
      `Start implement inactiveStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    const staff = await this.merchantProfileService.findOneById(staffId);

    if (!staff || staff.merchantManagerId !== currentUser.id) {
      return OperationError.MERCHANT_NOT_FOUND;
    }

    const order = await this.sharedOrderService.getPendingOrderByOperation(staff.id, staff.type);
    if (order) {
      return this.merchantProfileService.isMerchantOperator(staff) ?
        OperationError.CANNOT_DISABLE_OPERATOR_HAS_PENDING_ORDER :
        OperationError.CANNOT_DISABLE_SUPPORTER_HAS_PENDING_ORDER;
    }
    await this.updateStaffTransactionUseCase.updateStaffTransactional(staff, { status: OperationStatus.INACTIVE });
    this.log.debug(
      `Stop implement inactiveStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    return null;
  }
}
