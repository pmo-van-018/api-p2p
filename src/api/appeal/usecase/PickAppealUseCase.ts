import { AppealError } from '@api/appeal/errors/AppealError';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { RedlockUtil } from '@base/utils/redlock';
import { Operation } from '@api/profile/models/Operation';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';

@Service()
export class PickAppealUseCase {
  constructor(
    private adminAppealService: AdminAppealService,
    private masterDataService: SharedMasterDataService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}
  public async pickAppeal(currentUser: Operation, appealId: string) {
    return RedlockUtil.lock(appealId, async () => {
      const appeal = await this.adminAppealService.getAppealById(appealId, true);
      if (!appeal) {
        return AppealError.APPEAL_NOT_FOUND;
      }
      if (appeal.adminId) {
        return AppealError.APPEAL_ALREADY_HAS_SUPPORTER;
      }
      const numberAppealPicked = await this.adminAppealService.countPickedAppeal(currentUser.id);
      const masterData = await this.masterDataService.getLatestMasterDataCommon();

      if (numberAppealPicked >= masterData.appealReceivedByAdminSupporterLimit) {
        return AppealError.TOTAL_APPEAL_PICKED_LIMITS_ARE_EXCEEDED;
      }
      await this.adminAppealService.setAdminSupporter(appealId, currentUser.id);
      this.eventDispatcher.dispatch(events.actions.appeal.adminSupporterPickAppeal, {
        adminSupporter: currentUser.nickName,
        orderRefId: appeal.order.refId,
      });
      return null;
    });
  }
}
