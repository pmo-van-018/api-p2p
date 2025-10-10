import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SharedAppealService} from '@api/appeal/services/SharedAppealService';
import {SessionUtil} from '@base/utils/session.util';
import {events} from '@api/subscribers/events';
import {SocketFactory} from '@api/sockets/SocketFactory';

@Service()
export class InactiveAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedAppealService: SharedAppealService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async inactiveAdminSupporter(adminSupporterId: string) {
    this.log.debug(`Start implement inactiveAdminSupporter: ${adminSupporterId}`);
    const adminSupporter = await this.adminProfileService.findOneById(adminSupporterId, OperationType.ADMIN_SUPPORTER);
    if (!adminSupporter) {
      return OperationError.ADMIN_SUPPORTER_NOT_FOUND;
    }
    const appeal = await this.sharedAppealService.getOpenAppealByAdminSupporter(adminSupporterId);
    if (appeal) {
      return OperationError.CANNOT_DISABLE_ADMIN_SUPPORTER_HAS_PENDING_APPEAL;
    }
    await this.adminProfileService.updateAdmin(adminSupporterId, {
      status: OperationStatus.INACTIVE,
    });
    SessionUtil.destroy(adminSupporter.id.toString());
    this.socketFactory.emitToRoom(adminSupporter.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deactivated,
    });
    this.log.debug(`Stop implement inactiveAdminSupporter: ${adminSupporterId}`);
    return null;
  }
}
