import { Operation } from '@api/profile/models/Operation';

export class ListAvatarsBaseResponse {
  public avatars: string[];

  constructor(operation: Operation[]) {
    this.avatars = operation.map((op) => op.avatar);
  }
}
