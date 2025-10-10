import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {OperationType} from '@api/common/models';
import {events} from '@api/subscribers/events';
import {SessionUtil} from '@base/utils/session.util';
import {SocketFactory} from '@api/sockets/SocketFactory';

@Service()
export class DeleteSuperAdminUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteSuperAdmin(superAdminId: string) {
    this.log.debug(`Start implement deleteSuperAdmin ${superAdminId}`);

    const superAdmin = await this.adminProfileService.findOneById(superAdminId, OperationType.SUPER_ADMIN);
    if (!superAdmin) {
      return OperationError.SUPER_ADMIN_NOT_FOUND;
    }
    await this.adminProfileService.softDeleteOperation(superAdmin.id);
    this.log.debug(`[deleteSuperAdmin] Destroy session ${superAdmin.walletAddress}`);
    SessionUtil.destroy(superAdmin.id.toString());
    this.socketFactory.emitToRoom(superAdmin.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deleted,
    });

    this.log.debug(`Stop implement deleteSuperAdmin ${superAdminId}`);
    return null;
  }
}
