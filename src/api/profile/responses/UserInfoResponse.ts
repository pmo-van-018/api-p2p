import { User } from '@api/profile/models/User';
import { NotificationType, UserStatus, UserType } from '@api/common/models/P2PEnum';
import { Order } from '@api/order/models/Order';
import { env } from '@base/env';

export class UserInfoResponse {
  public id: string;
  public avatar: string;
  public walletAddress: string;
  public type: string;
  public nickName: string;
  public orders: Order[];
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public allowNotification: NotificationType[];
  public skipNoteAt: Date;
  public peerChatId: string;

  constructor(user: User) {
    this.id = user.id;
    this.avatar = user.avatar;
    this.walletAddress = user.walletAddress;
    this.type = UserType[user.type];
    this.nickName = user.nickName;
    this.orders = user.orders;
    this.status = UserStatus[user.status];
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.allowNotification = user.allowNotification;
    this.skipNoteAt = user.skipNoteAt;
    this.peerChatId = user.peerChatId;
  }
}

export class ShowInfoUserResponse extends UserInfoResponse {
  public totalReferred: number;
  public referralCode: string;
  public isReferred: boolean;

  constructor(data: { user: User, totalReferred: number }) {
    super(data.user);
    if (env.referral.enable) {
      this.referralCode = data.user?.referralCode;
      this.isReferred = data.user?.isReferred;
      this.totalReferred = data.totalReferred;
    }
  }
}
