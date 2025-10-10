import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import moment from 'moment';
import {events} from '@api/subscribers/events';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';

@Service()
export class ActiveAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async activeAdminSupporter(adminSupporterId: string) {
    this.log.debug(`Start implement activeAdminSupporter: ${adminSupporterId}`);
    const adminSupporter = await this.adminProfileService.findOneById(adminSupporterId, OperationType.ADMIN_SUPPORTER);
    if (!adminSupporter) {
      return OperationError.ADMIN_SUPPORTER_NOT_FOUND;
    }
    await this.adminProfileService.updateAdmin(adminSupporterId, {
      status: OperationStatus.ACTIVE,
      activatedAt: this.adminProfileService.isFirstActive(adminSupporter, OperationStatus.ACTIVE)
        ? moment.utc().toDate()
        : adminSupporter.activatedAt,
    });
    this.eventDispatcher.dispatch(events.actions.operator.activatedSupporterFromAdmin, {
      ...adminSupporter,
      status: OperationStatus.ACTIVE,
    });
    this.log.debug(`Stop implement activeAdminSupporter: ${adminSupporterId}`);
    return null;
  }
}
