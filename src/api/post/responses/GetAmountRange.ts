export class GetAmountRange {
  public maxAmount: number;
  public minAmount: number;

  constructor(data: any) {
    this.maxAmount = Number(data.maxAmount || 0);
    this.minAmount = Number(data.minAmount || 0);
  }
}
