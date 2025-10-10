import { Appeal } from '@api/appeal/models/Appeal';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { AppealInfoResponse } from '@api/appeal/responses/AppealInfoResponse';
import { Order } from '@api/order/models/Order';
import { OrderAppealResponse } from '@api/appeal/responses/OrderAppealResponse';

class UserInfoResponse {
  public id: string;
  public nickName: string;
  constructor(user: User | Operation) {
    this.id = user.id;
    this.nickName = user.nickName;
  }
}

export class AppealListOrderInfo extends OrderAppealResponse {
  constructor(order: Order) {
    super(order);
  }
}

export class AppealListResponse extends AppealInfoResponse {
  public order: AppealListOrderInfo;
  public addExtraAt: Date;
  public completedAt?: Date;
  public evidentAt: Date;
  public decisionAt: Date;
  public manager: UserInfoResponse;
  public user: UserInfoResponse;

  constructor(appeal: Appeal) {
    super(appeal);
    this.addExtraAt = appeal.addExtraAt;
    this.completedAt = appeal.completedAt;
    this.evidentAt = appeal.evidentAt;
    this.decisionAt = appeal.decisionAt;
    this.user = new UserInfoResponse(appeal.order.user);
    this.manager = new UserInfoResponse(appeal.order.merchant?.merchantManager);
    this.order = new AppealListOrderInfo(appeal.order);
  }
}
