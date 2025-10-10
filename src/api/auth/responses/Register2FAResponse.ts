export class Register2FAResponse {
  public success: boolean;

  constructor(result: { success: boolean }) {
    this.success = result.success;
  }
}
