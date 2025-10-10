class RevenueAndPriceByPeriodObject {
  public priceAvg: number;
  public totalFee: number;
  public totalPenaltyFee: number;
  public date: string;

  constructor(data: {priceAvg: number, totalFee: number, totalPenaltyFee: number, date: string}) {
    this.priceAvg = Number(data.priceAvg);
    this.totalFee = Number(data.totalFee);
    this.totalPenaltyFee = Number(data.totalPenaltyFee);
    this.date = data.date;
  }
}

export class RevenueAndPriceByPeriodResponse {
  public items: RevenueAndPriceByPeriodObject[];

  constructor(data: {priceAvg: number, totalFee: number, totalPenaltyFee: number, date: string}[]) {
    this.items = data.map((item) => new RevenueAndPriceByPeriodObject(item));
  }
}
