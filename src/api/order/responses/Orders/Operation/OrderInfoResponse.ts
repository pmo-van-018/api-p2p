import { TradeType } from '@api/common/models';
import { PaymentTicketStatus } from '@api/order/enums/PaymentTicketEnum';
import { Order, OrderStatus } from '@api/order/models/Order';
import { OperationBaseOrderResponse } from '@api/order/responses/Orders/Operation';
import { getKeyByValue } from '@base/utils/helper.utils';

export class OrderInfoResponse extends OperationBaseOrderResponse {
  public requestTotalPrice: number;
  public requestAmount: number;
  public isPaymentFromAnotherAccount: boolean;
  public paymentStatus: string;

  constructor(order: Order) {
    super(order);
    if (order.status === OrderStatus.CANCELLED) {
      delete this.timeout;
      delete this.transactions;
      this.requestTotalPrice = order.requestTotalPrice;
      this.requestAmount = order.requestAmount;
    }
    if (order.type === TradeType.SELL && order.paymentTickets?.length > 0) {
      const status = order.paymentTickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].status as number;
      this.paymentStatus = getKeyByValue(PaymentTicketStatus, status)
    }
    this.isPaymentFromAnotherAccount = order.isPaymentFromAnotherAccount;
  }
}

