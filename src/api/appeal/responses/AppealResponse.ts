import { Appeal, AppealStatus, BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { TradeType } from '@api/common/models/P2PEnum';

export class AppealResponse {
  public appealId: string;
  public operationWinnerId?: string;
  public userWinnerId?: string;
  public openAt: Date;
  public closeAt?: Date;
  public completedAt?: Date;
  public decisionAt?: Date;
  public note: string;
  public status: string;
  public decisionResult?: string;
  public roomId: string;
  public secret?: string;

  constructor(appeal: Appeal, orderType: TradeType | null = null) {
    if (!appeal) {
      return;
    }
    this.appealId = appeal.id;
    this.operationWinnerId = appeal.operationWinnerId;
    this.userWinnerId = appeal.userWinnerId;
    this.openAt = appeal.openAt;
    this.closeAt = appeal.closeAt;
    this.completedAt = appeal.completedAt;
    this.decisionAt = appeal.decisionAt;
    this.note = appeal.note;
    this.status = AppealStatus[appeal.status];
    this.secret = appeal.secret;
    this.decisionResult =
      appeal.decisionResult && orderType ? this.getDecisionResult(appeal.decisionResult, orderType) : null;
  }
  protected getDecisionResult(result: number, orderType: TradeType) {
    return orderType === TradeType.BUY ? BUY_APPEAL_RESULTS[result] : SELL_APPEAL_RESULTS[result];
  }
}
