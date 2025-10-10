import { SupportRequest } from '@api/support-request/models/SupportRequest';

export class GetSupportRequestUserResponse {
  public roomId: string;
  public id: string;

  constructor(supportRequest: SupportRequest) {
    this.roomId = supportRequest?.roomId;
    this.id = supportRequest?.refId;
  }
}
