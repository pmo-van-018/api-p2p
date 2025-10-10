import { AppealError } from '@api/appeal/errors/AppealError';
import { AddExtraTimeAppealRequest } from '@api/appeal/requests/AddExtraTimeAppealRequest';
import { Operation } from '@api/profile/models/Operation';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import moment from 'moment';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { OperationType, TradeType } from '@api/common/models';

@Service()
export class AddExtraTimeAppealUseCase {
  constructor(
    private adminAppealService: AdminAppealService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}
  public async addTimeHandleAppeal(currentUser: Operation, addMoreTimeAppealRequest: AddExtraTimeAppealRequest) {
    const appeal = await this.adminAppealService.getDetailAppeal(addMoreTimeAppealRequest.appealId);
    if (!appeal) {
      return AppealError.APPEAL_NOT_FOUND;
    }
    if (appeal.adminId && appeal.adminId !== currentUser.id && currentUser.type === OperationType.ADMIN_SUPPORTER) {
      return AppealError.PERMISSION_DENIED;
    }
    if (new Date(addMoreTimeAppealRequest.evidentTimeoutAt) < new Date()) {
      return AppealError.TIME_EXTRA_IS_IN_THE_PAST;
    }
    const evidentTimeoutAt = moment(addMoreTimeAppealRequest.evidentTimeoutAt).utc().toDate();
    const updatedData = await this.adminAppealService.addMoreTime(appeal.id, evidentTimeoutAt);
    appeal.completedAt = updatedData.completedAt;
    appeal.addExtraAt = updatedData.addExtraAt;
    const event = appeal.order.type === TradeType.BUY ? events.actions.appeal.extraTimeBuyAppeal : events.actions.appeal.extraTimeSellAppeal;
    this.eventDispatcher.dispatch(event, appeal);
    return null;
  }
}
