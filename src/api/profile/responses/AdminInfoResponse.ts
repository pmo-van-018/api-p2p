import { Operation } from '@api/profile/models/Operation';

export class AdminInfoResponse {
  public nickName: string;
  
  constructor(operation: Operation) {
    this.nickName = operation.nickName;
  }
}
