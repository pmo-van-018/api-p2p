import { RpcResponse } from '@api/order/responses/Orders/User/CryptoTransactionStatusResponse';
import { TradeType } from '@api/common/models';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { BUY_ORDER_STEPS, SELL_ORDER_STEP } from '@api/order/models/Order';

export class CryptoTransactionResponse {
  public orderId: string;
  public hash: string;
  public status: string;
  public step: string;
  public network: string;
  public txnStatus?: RpcResponse[];

  constructor({
    transaction,
    orderStep,
    orderType,
  }: {
    transaction: CryptoTransaction;
    orderStep: number;
    orderType: TradeType;
  }) {
    this.orderId = transaction.orderId;
    this.status = TransactionStatus[transaction.status];
    this.hash = transaction.hash;
    this.network = transaction.network;
    this.step = orderType === TradeType.BUY ? BUY_ORDER_STEPS[orderStep] : SELL_ORDER_STEP[orderStep];
    if (transaction.cryptoTransactionStatus) {
      this.txnStatus = transaction.cryptoTransactionStatus.map(
        (rpcStatus) => new RpcResponse({ rpc: rpcStatus.rpc, status: rpcStatus.status })
      );
    }
  }
}
