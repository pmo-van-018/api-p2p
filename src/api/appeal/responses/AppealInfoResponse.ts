import {Appeal, AppealStatus, BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS} from '@api/appeal/models/Appeal';
import {OperationType, TradeType} from '@api/common/models/P2PEnum';
import {AdminInfoResponse} from '@api/profile/responses/AdminInfoResponse';

export class AppealInfoResponse {
  public id: string;
  public createdAt: Date;
  public openAt: Date;
  public closeAt: Date;
  public actualCloseAt?: Date;
  public decisionResult?: string;
  public admin?: AdminInfoResponse;
  public nickNameAdminSupporter?: string;
  public numberOfExtension?: number;

  constructor(appeal: Appeal) {
    this.id = appeal.id;
    this.createdAt = appeal.createdAt;
    this.openAt = appeal.openAt;
    this.closeAt = appeal.closeAt;
    this.actualCloseAt = appeal.actualCloseAt;
    this.decisionResult = appeal.decisionResult ? this.getResult(appeal.order.type, appeal.decisionResult) : undefined;
    this.admin = appeal.admin && appeal.status === AppealStatus.CLOSE ? new AdminInfoResponse(appeal.admin) : undefined;
    this.nickNameAdminSupporter = appeal.admin?.type === OperationType.ADMIN_SUPPORTER ? appeal.admin?.nickName : '';
    this.numberOfExtension = appeal.numberOfExtension;
  }

  private getResult(orderType: TradeType, decisionResult: SELL_APPEAL_RESULTS | BUY_APPEAL_RESULTS) {
    return orderType === TradeType.BUY ? BUY_APPEAL_RESULTS[decisionResult] : SELL_APPEAL_RESULTS[decisionResult];
  }
}
