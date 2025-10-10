import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SessionUtil} from '@base/utils/session.util';
import {events} from '@api/subscribers/events';
import {SocketFactory} from '@api/sockets/SocketFactory';

@Service()
export class InactiveSuperAdminUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async inactiveSuperAdmin(superAdminId: string) {
    this.log.debug(`Start implement inactiveSuperAdmin: ${superAdminId}`);
    const systemAdmin = await this.adminProfileService.findOneById(superAdminId, OperationType.SUPER_ADMIN);
    if (!systemAdmin) {
      return OperationError.SUPER_ADMIN_NOT_FOUND;
    }
    await this.adminProfileService.updateAdmin(superAdminId, {
      status: OperationStatus.INACTIVE,
    });
    SessionUtil.destroy(systemAdmin.id.toString());
    this.socketFactory.emitToRoom(systemAdmin.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deactivated,
    });
    this.log.debug(`Stop implement inactiveSuperAdmin: ${superAdminId}`);
    return null;
  }
}
