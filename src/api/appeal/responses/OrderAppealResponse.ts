import { Order, OrderStatus } from '@api/order/models/Order';

export class OrderAppealResponse {
  public id: string;
  public status: string;
  public amount: number;
  public requestAmount: number;
  public price: number;
  public totalPrice: number;
  public requestTotalPrice: number;
  public assetName: string;
  public assetNetwork: string;
  public fiatName: string;
  public fiatSymbol: string;
  public type: string;

  constructor(order: Order) {
    this.id = order.refId;
    this.status = OrderStatus[order.status];
    this.amount = order.amount;
    this.requestAmount = order.requestAmount;
    this.price = order.price;
    this.totalPrice = order.totalPrice;
    this.requestTotalPrice = order.requestTotalPrice;
    this.assetName = order.asset.name;
    this.assetNetwork = order.asset.network;
    this.fiatName = order.fiat.name;
    this.fiatSymbol = order.fiat.symbol;
    this.type = order.type;
  }
}
