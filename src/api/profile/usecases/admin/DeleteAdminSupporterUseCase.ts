import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {OperationType} from '@api/common/models';
import {events} from '@api/subscribers/events';
import {SessionUtil} from '@base/utils/session.util';
import {SocketFactory} from '@api/sockets/SocketFactory';
import {SharedAppealService} from '@api/appeal/services/SharedAppealService';

@Service()
export class DeleteAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedAppealService: SharedAppealService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteAdminSupporter(adminSupporterId: string) {
    this.log.debug(`Start implement deleteAdminSupporterFromAdmin for admin supporter ${adminSupporterId}`);

    const adminSupporter = await this.adminProfileService.findOneById(adminSupporterId, OperationType.ADMIN_SUPPORTER);
    if (!adminSupporter) {
      return OperationError.ADMIN_SUPPORTER_NOT_FOUND;
    }
    const appeal = await this.sharedAppealService.getOpenAppealByAdminSupporter(adminSupporterId);
    if (appeal) {
      return OperationError.CANNOT_DISABLE_ADMIN_SUPPORTER_HAS_PENDING_APPEAL;
    }
    await this.adminProfileService.softDeleteOperation(adminSupporter.id);
    this.log.debug(`[deleteAdminSupporterFromAdmin] Destroy session ${adminSupporter.walletAddress}`);
    SessionUtil.destroy(adminSupporter.id.toString());
    this.socketFactory.emitToRoom(adminSupporter.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deleted,
    });

    this.log.debug(`Stop implement deleteAdminSupporterFromAdmin for admin supporter ${adminSupporterId}`);
    return null;
  }
}
