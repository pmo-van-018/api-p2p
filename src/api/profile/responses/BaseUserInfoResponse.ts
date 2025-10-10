import { User } from '@api/profile/models/User';

export class BaseUserInfoResponse {
  public id: string;
  public nickName: string;
  public walletAddress: string;

  constructor(user: User) {
    this.id = user?.id;
    this.walletAddress = user?.walletAddress;
    this.nickName = user?.nickName;
  }
}
