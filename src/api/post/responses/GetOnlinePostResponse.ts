export class PostOnlineResponse {
  public identifier: string[];

  constructor(data: string[]) {
    this.identifier = data;
  }
}
