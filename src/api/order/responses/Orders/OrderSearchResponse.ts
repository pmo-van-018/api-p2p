import { Order } from '@api/order/models/Order';

export class OrderPriceStatisticByPeriodResponse {
  public items: OrderPriceStatisticByPeriodBaseResponse[];

  constructor(data: Order[]) {
    this.items = data.map((item) => new OrderPriceStatisticByPeriodBaseResponse(item));
  }
}

export class OrderPriceStatisticByPeriodBaseResponse {
  public price: number;
  public benchmarkPriceAtCreated: number;
  public benchmarkPriceAtSent: number;
  public refId: string;

  constructor(data: Order) {
    this.price = Number(data.price);
    this.benchmarkPriceAtCreated = Number(data.benchmarkPriceAtCreated);
    this.benchmarkPriceAtSent = Number(data.benchmarkPriceAtSent);
    this.refId = data.refId;
  }
}
