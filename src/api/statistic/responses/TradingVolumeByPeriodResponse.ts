class TradingVolumeByPeriodObject {
  public completedGroupHour: number;
  public totalPrice: number;

  constructor(data: {completedGroupHour: number, totalPrice: number}) {
    this.completedGroupHour = data.completedGroupHour;
    this.totalPrice = Number(data.totalPrice);
  }
}

export class TradingVolumeByPeriodResponse {
  public items: TradingVolumeByPeriodObject[];

  constructor(data: {completedGroupHour: number, totalPrice: number}[]) {
    this.items = data.map((item) => new TradingVolumeByPeriodObject(item));
  }
}
