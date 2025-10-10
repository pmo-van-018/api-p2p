import { BlacklistEntity } from '@api/blacklist/models/BlacklistEntity';

export class BlacklistBaseResponse {
  public id: string;
  public walletAddress: string;
  public type: number;
  public createdAt: Date;

  constructor(data: BlacklistEntity) {
    this.id = data.id;
    this.walletAddress = data.walletAddress;
    this.type = data.type;
    this.createdAt = data.createdAt;
  }
}
