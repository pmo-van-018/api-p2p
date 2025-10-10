export class GetShiftStatusResponse {
  public readonly isProcessing: boolean;

  constructor(isProcessing: boolean) {
    this.isProcessing = isProcessing;
  }
}
