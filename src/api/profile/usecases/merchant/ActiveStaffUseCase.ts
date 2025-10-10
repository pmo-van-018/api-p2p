import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {OperationError} from '@api/errors/OperationError';
import {Operation} from '@api/profile/models/Operation';
import {OperationStatus} from '@api/common/models';
import {events} from '@api/subscribers/events';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';

@Service()
export class ActiveStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async activeStaff(currentUser: Operation, staffId: string) {
    this.log.debug(
      `Start implement activeStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    const staff = await this.merchantProfileService.findOneById(staffId);

    if (!staff || staff.merchantManagerId !== currentUser.id) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    await this.merchantProfileService.updateStaff(staffId, { status: OperationStatus.ACTIVE });
    staff.status = OperationStatus.ACTIVE;
    this.eventDispatcher.dispatch(
      this.merchantProfileService.isMerchantOperator(staff)
        ? events.actions.operator.activatedFromManager
        : events.actions.supporter.activatedFromManager,
      { staff }
    );
    this.log.debug(
      `Stop implement activeStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    return null;
  }
}
