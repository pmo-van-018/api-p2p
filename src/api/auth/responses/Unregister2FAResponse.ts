export class Unregister2FAResponse {
  public success: boolean;

  constructor(result: { success: boolean }) {
    this.success = result.success;
  }
}
