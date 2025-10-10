import { SupportRequestStatus, SupportRequestType } from '@api/support-request/models/SupportRequestEnum';
import { SupportRequest } from '@api/support-request/models/SupportRequest';

export class GetSupportRequestDetailResponse {
  public id: string;
  public status: SupportRequestStatus;
  public type: SupportRequestType;
  public userName: string;
  public userId: string;
  public userWalletAddress: string;
  public adminName: string;
  public roomId: string;
  public createdAt: Date;
  public updatedAt: Date;
  public adminId: string;
  public completedAt: Date;
  constructor(supportRequest: SupportRequest) {
    this.id = supportRequest.refId;
    this.status = supportRequest.status;
    this.type = supportRequest.type;
    this.adminName = supportRequest.admin?.nickName;
    this.roomId = supportRequest.roomId;
    this.createdAt = supportRequest.createdAt;
    this.updatedAt = supportRequest.updatedAt;
    this.adminId = supportRequest.adminId;
    this.userName = supportRequest.user?.nickName;
    this.userId = supportRequest.user?.id;
    this.userWalletAddress = supportRequest.user?.walletAddress;
    this.completedAt = supportRequest.completedAt;
  }
}
