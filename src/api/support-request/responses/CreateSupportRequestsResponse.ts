import { SupportRequest } from '@api/support-request/models/SupportRequest';

export class CreateSupportRequestsResponse {
  public id: string;
  public roomId: string;
  constructor(supportRequest: SupportRequest) {
    this.id = supportRequest.refId;
    this.roomId = supportRequest.roomId;
  }
}
