import { Appeal, BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { TradeType } from '@api/common/models';
import { OrderStatus } from '@api/order/models/Order';

export class TelegramAppealDetailResponse {
  public orderRefId: string;
  public type: TradeType;
  public status: string;
  public assetName: string;
  public assetNetwork: string;
  public createdAt: Date;
  public merchant: {
    nickname: string,
  };
  public appeal: {
    openAt: Date,
    closeAt?: Date,
    actualCloseAt?: Date,
    decisionResult?: string,
    decisionAt: Date,
    winner?: string,
  };
  constructor(appeal: Appeal) {
    this.orderRefId = appeal.order.refId;
    this.type = appeal.order.type;
    this.status = OrderStatus[appeal.order.status];
    this.assetName = appeal.order.asset.name;
    this.assetNetwork = appeal.order.asset.network;
    this.createdAt = appeal.order.createdAt;
    this.merchant = { nickname: appeal.order?.merchant?.merchantManager?.nickName };
    this.appeal = {
      openAt: appeal.openAt,
      closeAt: appeal.closeAt,
      actualCloseAt: appeal.actualCloseAt,
      decisionResult: appeal.decisionResult ? this.getResult(appeal.order.type, appeal.decisionResult) : null,
      decisionAt: appeal.decisionAt,
      winner: appeal.userWinner ? appeal.userWinner.nickName : appeal.operationWinner?.merchantManager?.nickName,
    };
  }

  private getResult(orderType: TradeType, decisionResult: SELL_APPEAL_RESULTS | BUY_APPEAL_RESULTS) {
    return orderType === TradeType.BUY ? BUY_APPEAL_RESULTS[decisionResult] : SELL_APPEAL_RESULTS[decisionResult];
  }
}
