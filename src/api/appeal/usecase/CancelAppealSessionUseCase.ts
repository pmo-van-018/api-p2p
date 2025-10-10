import { AppealError } from '@api/appeal/errors/AppealError';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { RedlockUtil } from '@base/utils/redlock';

@Service()
export class CancelAppealSessionUseCase {
  constructor(
    private adminAppealService: AdminAppealService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}
  public async cancelAppealSession(appealId: string) {
    return await RedlockUtil.lock(appealId, async () => {
      const appeal = await this.adminAppealService.getAppealById(appealId, true);
      if (!appeal) {
        return AppealError.APPEAL_NOT_FOUND;
      }
      if (!appeal.adminId) {
        return AppealError.APPEAL_EMPTY_ADMIN_SUPPORTER;
      }
      await this.adminAppealService.setAdminSupporter(appealId, null);
      this.eventDispatcher.dispatch(events.actions.appeal.adminCancelAppealSession, {
        adminId: appeal.adminId,
        appealId: appeal.id,
        orderId: appeal?.order?.refId,
      });
      return null;
    });
  }
}
