import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {MerchantOrderLifecycleService} from '@api/order/services/order/MerchantOrderLifecycleService';
import {
  CryptoTransactionStatusResponse,
  RpcResponse
} from '@api/order/responses/Orders/User/CryptoTransactionStatusResponse';
import {P2PError} from '@api/common/errors/P2PError';
import {SELL_ORDER_STEP} from '@api/order/models/Order';
import {TRANSACTION_RECEIPT_STATUS_TYPE, TransactionStatus} from '@api/order/models/CryptoTransaction';
import {BlockchainTransactionService} from '@api/order/services/BlockchainTransactionService';
import {CryptoTransactionService} from '@api/order/services/CryptoTransactionService';

@Service()
export class CheckTransactionCryptoStatusUseCase {
  constructor(
    private merchantOrderService: MerchantOrderLifecycleService,
    private blockchainService: BlockchainTransactionService,
    private cryptoTransactionService: CryptoTransactionService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async checkTransactionStatus(operatorId: string, orderRefId: string) {
    this.log.debug('Start implement checkTransactionStatus method for: ', operatorId);
    const order = await this.merchantOrderService.getFullInfoByRefId(orderRefId);

    if (!order) {
      throw new P2PError(OrderLifeCycleError.ORDER_NOT_FOUND);
    }

    if (![
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
    ].includes(order.step)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    if (operatorId !== order.merchantId) {
      return OrderLifeCycleError.OPERATOR_NOT_OWN_ORDER;
    }

    const cryptoTxn = order.cryptoTransactions?.filter((txn) => txn.status === TransactionStatus.SUCCEED)?.[0];
    if (!cryptoTxn) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    if ((cryptoTxn.cryptoTransactionStatus?.length ?? 0) === 0) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    const rpcStatuses = await Promise.all(
      cryptoTxn.cryptoTransactionStatus.map(async (txnStatus) => {
        let status: TRANSACTION_RECEIPT_STATUS_TYPE;
        try {
          status = await this.blockchainService.getTransactionReceiptStatus(
            cryptoTxn.hash,
            txnStatus.rpc,
            cryptoTxn.network
          );
        } catch (error) {
          status = TRANSACTION_RECEIPT_STATUS_TYPE.FAILED;
        }
        const rpcStatus = !status
          ? TransactionStatus.PENDING
          : status === TRANSACTION_RECEIPT_STATUS_TYPE.SUCCESS
            ? TransactionStatus.SUCCEED
            : TransactionStatus.FAILED;
        txnStatus.status = rpcStatus;
        return new RpcResponse({ rpc: txnStatus.rpc, status: rpcStatus });
      })
    );
    await this.cryptoTransactionService.saveCryptoTransactionStatus(cryptoTxn.cryptoTransactionStatus);
    this.log.debug('Stop implement checkTransactionStatus method for: ', operatorId);
    return new CryptoTransactionStatusResponse({ txnHash: cryptoTxn.hash, rpcStatus: rpcStatuses });
  }
}
