import { EventSubscriber, On } from 'event-dispatch';
import { Container } from 'typedi';

import { AppealQueueService } from '@api/appeal/queues/AppealQueueService';
import { Order } from '@api/order/models/Order';
import { User } from '@api/profile/models/User';
import { events } from './events';
import { Operation } from '@api/profile/models/Operation';
import { Appeal } from '@api/appeal/models/Appeal';

@EventSubscriber()
export class AppealEventSubscriber {
  private appealQueueService: AppealQueueService;

  constructor() {
    this.appealQueueService = Container.get<AppealQueueService>(AppealQueueService);
  }

  @On(events.actions.appeal.userCreateAppeal)
  public async onUserCreateAppeal(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.userCreateAppeal, order);
  }

  @On(events.actions.appeal.extraTimeBuyAppeal)
  public async onExtraTime(appeal: Appeal): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.extraTimeBuyAppeal, appeal);
  }

  @On(events.actions.appeal.userBuyAppeal)
  public async onUserBuyAppeal(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.userBuyAppeal, { order });
  }

  @On(events.actions.appeal.closeAppealInBuy)
  public async onCloseAppealInBuy(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.closeAppealInBuy, { order });
  }

  @On(events.actions.appeal.resultBuyAppealUserWin)
  public async onResultBuyAppealUserWin(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.resultBuyAppealUserWin, { order });
  }

  @On(events.actions.appeal.closeBuyAppealNotEvident)
  public async onCloseBuyAppealNotEvident(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.closeBuyAppealNotEvident, { order });
  }

  @On(events.actions.appeal.reopenBuyAppealUserWin)
  public async onReopenBuyAppealUserWin(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.reopenBuyAppealUserWin, { order });
  }

  @On(events.actions.appeal.resultBuyAppealMerchantWin)
  public async onResultBuyAppealMerchantWin(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.resultBuyAppealMerchantWin, { order });
  }

  @On(events.actions.appeal.userSellAppeal)
  public async onUserSellAppeal(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.userSellAppeal, { order });
  }

  @On(events.actions.appeal.extraTimeSellAppeal)
  public async onExtraTimeSellAppeal(appeal: Appeal): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.extraTimeSellAppeal, appeal);
  }

  @On(events.actions.appeal.closeSellAppeal)
  public async onCloseSellAppeal(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.closeSellAppeal, { order });
  }

  @On(events.actions.appeal.resultSellAppealMerchantWin)
  public async onResultSellAppealMerchantWin(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.resultSellAppealMerchantWin, { order });
  }

  @On(events.actions.appeal.resultSellAppealUserWin)
  public async onResultSellAppealUserWin(order: Order): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.resultSellAppealUserWin, { order });
  }

  @On(events.actions.appeal.closeAppeal)
  public async onCloseAppeal(appealId: string): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.closeAppeal, { appealId });
  }

  @On(events.actions.appeal.adminSupporterPickAppeal)
  public async onAdminSupporterPickAppealOrder(payload: { adminSupporter: string, orderRefId: string }): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.adminSupporterPickAppeal, payload);
  }

  @On(events.actions.appeal.adminCancelAppealSession)
  public async onAdminCancelAppealSession(data: { appealId: string, adminId: string, orderId: string }): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.adminCancelAppealSession, data);
  }

  @On(events.actions.appeal.userAgreeToMerchant)
  public async agreeToMerchant(data: { order: Order; supporters: Operation[] }): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.userAgreeToMerchant, data);
  }

  @On(events.actions.supportRequest.createNewSupportRequest)
  public async createNewSupportRequest(userName: string): Promise<void> {
    this.appealQueueService.add(events.actions.supportRequest.createNewSupportRequest, userName);
  }

  @On(events.actions.supportRequest.supportRequestPicked)
  public async supportRequestPicked(supportRequestId: string): Promise<void> {
    this.appealQueueService.add(events.actions.supportRequest.supportRequestPicked, supportRequestId);
  }

  @On(events.actions.supportRequest.resolvedSupportRequest)
  public async resolvedSupportRequest(payload: { user: User }): Promise<void> {
    const { user } = payload;
    this.appealQueueService.add(events.actions.supportRequest.resolvedSupportRequest, user);
  }

  @On(events.actions.appeal.supporterReceiveAppealOrder)
  public async onSupporterReceiveAppealOrder(payload: { orderId: string }): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.supporterReceiveAppealOrder, payload);
  }
  @On(events.actions.appeal.supporterResolveAppealOrder)
  public async onSupporterResolveAppealOrder(payload: { orderId: string }): Promise<void> {
    this.appealQueueService.add(events.actions.appeal.supporterResolveAppealOrder, payload);
  }
}
