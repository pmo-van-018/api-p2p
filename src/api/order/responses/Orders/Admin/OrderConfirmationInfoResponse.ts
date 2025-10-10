import { Order, OrderStatus } from '@api/order/models/Order';
import { PaymentMethodResponse } from '@api/payment/responses/PaymentMethodResponse';

export class OrderConfirmationInfoResponse {
  public id: string;
  public orderRefId: string;
  public amount: number;
  public price: number;
  public totalPrice: number;
  public status: string;
  public createdAt: Date;
  public assetName: string;
  public assetNetwork: string;
  public contract: string;
  public fiatName: string;
  public fiatSymbol: string;
  public bankAccountName: string;
  public bankNumber: string;
  public bankName: string;
  public transCode: string;
  public type: string;

  constructor(order: Order) {
    this.id = order.refId;
    this.orderRefId = order.refId;
    this.amount = order.amount;
    this.status = OrderStatus[order.status];
    this.createdAt = order.createdTime;
    this.assetName = order.asset.name;
    this.assetNetwork = order.asset.network;
    this.contract = order.asset.contract;
    this.fiatName = order.fiat.name;
    this.fiatSymbol = order.fiat.symbol;
    this.price = order.price;
    this.totalPrice = order.totalPrice;
    this.transCode = order.transCode;
    this.type = order.type;
    const paymentMethod = new PaymentMethodResponse(order.paymentMethod);
    this.bankAccountName = paymentMethod.bankHolder;
    this.bankNumber = paymentMethod.bankNumber;
    this.bankName = paymentMethod.bankName;
  }
}
