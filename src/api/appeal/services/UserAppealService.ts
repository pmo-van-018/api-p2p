import { AppealRepository } from '@api/appeal/repositories/AppealRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseAppealService } from '@api/appeal/services/BaseAppealService';
import { Appeal, AppealStatus } from '@api/appeal/models/Appeal';
import moment from 'moment';
import { Order } from '@api/order/models/Order';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { TradeType } from '@api/common/models';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { generateSecretCode } from '@base/utils/helper.utils';

export class UserAppealService extends BaseAppealService {
  constructor(
    @InjectRepository() public appealRepository: AppealRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private sharedMasterDataService: SharedMasterDataService
  ) {
    super(appealRepository);
  }

  public async createAppeal(order: Order): Promise<Appeal | null> {
    const masterData = await this.sharedMasterDataService.getLatestMasterDataCommon();
    const openAppealTime = order?.configuration?.evidenceProvisionTimeLimit || masterData?.evidenceProvisionTimeLimit;
    const openAt = moment.utc().toDate();
    const closeAt = moment.utc().add(openAppealTime, 'minutes').toDate();
    const appeal = new Appeal();
    appeal.status = AppealStatus.OPEN;
    appeal.operationWinnerId = null;
    appeal.userWinnerId = null;
    appeal.createdAt = openAt;
    appeal.openAt = openAt;
    appeal.closeAt = closeAt;
    appeal.completedAt = closeAt;
    appeal.note = null;
    appeal.secret = generateSecretCode('APPEAL_');
    return await this.appealRepository.save(appeal);
  }

  public async openAppeal(id: string) {
    const payload = {
      status: AppealStatus.OPEN,
      openAt: moment.utc().toDate(),
      secret: generateSecretCode('APPEAL_'),
    };
    await this.appealRepository.update(id, payload);
    return payload;
  }

  public async emitAppealOrder(order: Order) {
    const orderEvents = order.type === TradeType.BUY
      ? [events.actions.order.buy.systemUpdateStep, events.actions.appeal.userBuyAppeal]
      : [events.actions.order.sell.systemUpdateStepOrder, events.actions.appeal.userSellAppeal];
    await sendSystemNotification(order);
    this.eventDispatcher.dispatch(
      [...orderEvents, events.actions.appeal.userCreateAppeal],
      order
    );
  }
}
