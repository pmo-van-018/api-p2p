import { TransactionStatus } from "@api/order/models/CryptoTransaction";

export class RpcResponse {
  public rpc: string
  public status: string
  constructor(data: { rpc: string, status: TransactionStatus }) {
    this.rpc = data.rpc;
    this.status = TransactionStatus[data.status];
  }
}

export class CryptoTransactionStatusResponse {
  public txnHash: string;
  public rpcStatus: RpcResponse[]
  constructor(data: { txnHash: string, rpcStatus: RpcResponse[] }) {
    this.txnHash = data.txnHash;
    this.rpcStatus = data.rpcStatus;
  }
}
