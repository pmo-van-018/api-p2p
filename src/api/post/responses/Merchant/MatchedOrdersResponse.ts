import { Order, OrderStatus } from '@api/order/models/Order';

export class MatchedOrdersResponse {
  public id: string;
  public totalPrice: number;
  public transCode: string;
  public amount: number;
  public price: number;
  public totalFee: number;
  public fee: number;
  public totalPenaltyFee: number;
  public penaltyFee: number;
  public completedTime: Date;
  public status: string;

  constructor(order: Order) {
    this.id = order.refId;
    this.status = OrderStatus[order.status];
    this.amount = order.amount;
    this.price = order.price;
    this.totalPrice = order.totalPrice;
    this.transCode = order.transCode;
    this.completedTime = order.completedTime;
    this.fee = order.fee;
    this.totalFee = order.totalFee;
    this.penaltyFee = order.penaltyFee;
    this.totalPenaltyFee = order.totalPenaltyFee;
  }
}
