import { Operation } from '@api/profile/models/Operation';
import { NotificationType, OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { Order } from '@api/order/models/Order';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { TwoFactorAuthStatus } from '@api/auth/enums/TwoFactorAuth';

export class OperationInfoResponse {
  public id: string;
  public walletAddress: string;
  public type: string;
  public nickName: string;
  public orders: Order[];
  public merchantLevel?: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public allowNotification: NotificationType[];
  public skipNoteAt: Date;
  public contractFrom: Date;
  public peerChatId: string;
  public avatar?: string;
  public twoFactorAuth: Pick<TwoFactorAuth, 'totpStatus'>;

  constructor(operation: Operation) {
    this.id = operation.id;
    this.walletAddress = operation.walletAddress;
    this.type = OperationType[operation.type];
    this.nickName = operation.nickName;
    this.orders = operation.orders;
    this.merchantLevel = operation.merchantLevel;
    this.status = OperationStatus[operation.status];
    this.createdAt = operation.createdAt;
    this.updatedAt = operation.updatedAt;
    this.contractFrom = operation.contractFrom;
    this.allowNotification = operation.allowNotification;
    this.skipNoteAt = operation.skipNoteAt;
    this.peerChatId = operation.peerChatId;
    this.avatar = operation.avatar;
    this.twoFactorAuth = {
      totpStatus: operation.twoFactorAuth?.totpStatus || TwoFactorAuthStatus.UNAUTHORIZED,
    };
  }
}
