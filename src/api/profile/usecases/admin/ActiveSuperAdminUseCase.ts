import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {events} from '@api/subscribers/events';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';

@Service()
export class ActiveSuperAdminUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async activeSuperAdmin(superAdminId: string) {
    this.log.debug(`Start implement activeSuperAdmin: ${superAdminId}`);
    const superAdmin = await this.adminProfileService.findOneById(superAdminId, OperationType.SUPER_ADMIN);
    if (!superAdmin) {
      return OperationError.SUPER_ADMIN_NOT_FOUND;
    }
    await this.adminProfileService.updateAdmin(superAdminId, {
      status: OperationStatus.ACTIVE,
    });
    this.eventDispatcher.dispatch(events.actions.operator.activatedSuperAdmin, {
      adminId: superAdminId,
      nickName: superAdmin.nickName,
      walletAddress: superAdmin.walletAddress,
    });
    this.log.debug(`Stop implement activeSuperAdmin: ${superAdminId}`);
    return null;
  }
}
