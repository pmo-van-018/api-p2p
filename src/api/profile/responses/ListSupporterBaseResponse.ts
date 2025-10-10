import { Operation } from '@api/profile/models/Operation';

export class ListSupporterBaseResponse {
  public items: InfoSupporterBaseResponse[];

  constructor(operation: Operation[]) {
    this.items = operation.map((merchant) => new InfoSupporterBaseResponse(merchant));
  }
}

export class InfoSupporterBaseResponse {
  public id: string;
  public nickName: string;
  public walletAddress: string;

  constructor(operation: Operation) {
    this.id = operation.id;
    this.nickName = operation.nickName;
    this.walletAddress = operation.walletAddress;
  }
}
