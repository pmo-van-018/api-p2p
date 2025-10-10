import { Job, QueueBaseOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import pLimit from 'p-limit';
import { Observable, Subject, of } from 'rxjs';
import { Service } from 'typedi';

import { QUEUE_NAME } from '@api/common/models/P2PConstant';
import { CryptoTransactionError } from '@api/order/errors/CryptoTransactionError';
import { events } from '@api/subscribers/events';
import { env } from '@base/env';
import { WorkerConfig } from './WorkerConfig';
import { WorkerInterface } from './WorkerInterface';

import { Logger, LoggerInterface } from '@base/decorators/Logger';

import { BLOCKCHAIN_NETWORKS, TradeType } from '@api/common/models';
import {
  CryptoTransaction,
  TRANSACTION_RECEIPT_STATUS_TYPE,
  TransactionFailCode,
  TransactionStatus,
} from '@api/order/models/CryptoTransaction';
import { BlockchainTransactionService } from '@api/order/services/BlockchainTransactionService';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { SystemBuyOrderLifecycleService } from '@api/order/services/order/buy';
import { SystemSellOrderLifecycleService } from '@api/order/services/order/sell';
import { BullMQService } from '@base/job-queue/BullMQ/BullMQService';

import Timeout = NodeJS.Timeout;

import { ValidateCryptoTransactionResult } from '@api/common/types';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { TronTransaction } from '@api/order/interfaces/Tron';
import { CryptoTransactionStatus } from '@api/order/models/CryptoTransactionStatus';
import { BUY_ORDER_STEPS, Order, SELL_ORDER_STEP } from '@api/order/models/Order';
import { getTronTransaction } from '@api/order/services/TronService';
import { Spanning, Tracing } from '@base/decorators/Tracing';
import BigNumber from 'bignumber.js';
import { providers } from 'ethers';
import moment from 'moment';

@Service()
export default class CryptoTransactionWorker implements WorkerInterface {
  public transactionProcessMap: Map<string, CryptoTransaction> = new Map<string, CryptoTransaction>();
  private subject: Subject<any>;
  private interval: Timeout | number;
  private done: boolean;

  private readonly QUEUE_NAME = QUEUE_NAME.CRYPTO_TRANSACTION;

  private bullConfig: QueueBaseOptions = {
    connection: {
      host: env.redis.host,
      port: env.redis.port,
      connectTimeout: 50000,
      keepAlive: 30000,
    },
  };

  private readonly _bullMQService: BullMQService;

  constructor(
    @Logger(__filename) private log: LoggerInterface,
    private config: WorkerConfig,
    private cryptoTransactionService: CryptoTransactionService,
    private systemBuyOrderLifecycleService: SystemBuyOrderLifecycleService,
    private systemSellOrderLifecycleService: SystemSellOrderLifecycleService,
    private blockChainTransactionService: BlockchainTransactionService,
    private sharedMasterDataService: SharedMasterDataService
  ) {
    this._bullMQService = new BullMQService();
    this._bullMQService.createWorker(this.QUEUE_NAME, this.getWorkerProcessor(), this.getWorkerOpts());
  }

  public async start(): Promise<Observable<any>> {
    this.log.info('+++ Start CryptoTransactionWorker +++');
    if (this.subject) {
      return this.subject;
    }

    this.subject = new Subject<any>();

    const transactions = await this.cryptoTransactionService.getPendingListByWorker();
    if (transactions !== null) {
      transactions.map((transaction) => this.transactionProcessMap.set(transaction.id, transaction));
      this.log.info(`Total transactions processing: ${this.transactionProcessMap.size}`);
    }

    this.subject.next(this.checkTransactionStatus());

    this.interval = setInterval(() => {
      if (this.done) {
        this.subject.next(this.checkTransactionStatus());
      }
    }, this.config.runCryptoTransactionInterval);

    return this.subject;
  }

  public async stop(): Promise<Observable<any>> {
    this.log.info('+++ Stopping CryptoTransactionWorker +++');

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.subject) {
      this.subject.complete();
    }

    return this.subject || of();
  }

  private getWorkerProcessor() {
    return async (job: Job) => {
      switch (job.name) {
        case events.actions.order.buy.merchantSubmitTransaction:
          await this.handleMerchantSubmitTransactionOrderBuy(job.data);
          break;
        case events.actions.order.sell.userSubmitTransaction:
          await this.handleUserSubmitTransactionOrderSell(job.data);
          break;
        case events.actions.cryptoTransaction.missingTransaction:
          await this.handleMissingTransaction(job.data);
          break;
        default:
          break;
      }
    };
  }

  private async handleMerchantSubmitTransactionOrderBuy(payload: { cryptoTransaction: CryptoTransaction }) {
    const { cryptoTransaction } = payload;
    this.transactionProcessMap.set(cryptoTransaction.id, plainToInstance(CryptoTransaction, cryptoTransaction));
  }

  private async handleUserSubmitTransactionOrderSell(payload: { cryptoTransaction: CryptoTransaction }) {
    const { cryptoTransaction } = payload;
    this.transactionProcessMap.set(cryptoTransaction.id, plainToInstance(CryptoTransaction, cryptoTransaction));
  }

  private async handleMissingTransaction(data: { transactionIds: string[] }) {
    const { transactionIds } = data;
    const cryptoTransactionsIds = [];
    transactionIds?.map((id) => {
      if (!this.transactionProcessMap.has(id)) {
        cryptoTransactionsIds.push(id);
      }
    });
    if (cryptoTransactionsIds.length) {
      const cryptoTransactions = await this.cryptoTransactionService.getTransactionsByIds(cryptoTransactionsIds);
      cryptoTransactions.map((transaction) =>
        this.transactionProcessMap.set(transaction.id, plainToInstance(CryptoTransaction, transaction))
      );
    }
  }

  @Tracing()
  private async checkTransactionStatus() {
    const limit = pLimit(50);

    this.done = false;

    const transactions: CryptoTransaction[] = Array.from(this.transactionProcessMap.values()).filter(
      (transaction) => transaction.status === TransactionStatus.PENDING
    );

    if (transactions.length) {
      const transactionPromises = transactions.map((transaction) =>
        limit(this.checkTransactionReceipt.bind(this, transaction))
      );
      await Promise.allSettled(transactionPromises);
    }
    this.done = true;
  }

  @Spanning()
  private async checkTransactionReceipt(transaction: CryptoTransaction) {
    switch (transaction.network) {
      case BLOCKCHAIN_NETWORKS.TRON:
        await this.checkTRONTransactionReceipt(transaction);
        break;
      default:
        await this.checkETHTransactionReceipt(transaction);
        break;
    }
  }

  @Spanning()
  private async checkTRONTransactionReceipt(transaction: CryptoTransaction) {
    let result = null;
    const orderLifecycleService =
      transaction.order.type === TradeType.BUY
        ? this.systemBuyOrderLifecycleService
        : this.systemSellOrderLifecycleService;

    await this.createMissingCryptoTransactionStatuses(transaction);

    await Promise.all(
      transaction.cryptoTransactionStatus.map(async (cryptoTransactionStatus) => {
        try {
          const tronTransaction = await getTronTransaction(transaction.hash);
          if (tronTransaction) {
            const validateResponse = this.validateTronTransaction(tronTransaction, transaction);
            cryptoTransactionStatus.status = validateResponse.isValid
              ? TransactionStatus.SUCCEED
              : TransactionStatus.FAILED;
            transaction.failCode = validateResponse.errorCode;
          } else if (await this.transactionMinutesTimeout(transaction)) {
            cryptoTransactionStatus.status = TransactionStatus.FAILED;
            transaction.failCode = TransactionFailCode.TRANSACTION_TIMEOUT;
          }
        } catch (error: any) {
          this.log.error(`Error checkTRONTransactionReceipt hash ${transaction.hash}:`, error);
          cryptoTransactionStatus.status = TransactionStatus.FAILED;
          transaction.failCode = TransactionFailCode.RPC_UNKNOW_ERROR;
        }
        return cryptoTransactionStatus;
      })
    );

    if (transaction.cryptoTransactionStatus.some((item) => item.status === TransactionStatus.SUCCEED)) {
      transaction.status = TransactionStatus.SUCCEED;
      result = await orderLifecycleService.updateTransactionStatus(transaction);
    } else if (await this.transactionMinutesTimeout(transaction)) {
      if (transaction.failCode === TransactionFailCode.RPC_UNKNOW_ERROR) {
        result = await this.systemSellOrderLifecycleService.updateTransactionUnknownStatus(transaction);
      } else {
        transaction.status = TransactionStatus.FAILED;
        transaction.failCode = transaction.failCode || TransactionFailCode.TRANSACTION_TIMEOUT;
        result = await orderLifecycleService.updateTransactionStatus(transaction);
      }
    }

    this.checkAndCleanProcess(result, transaction);
  }

  private validateTronTransaction(
    tronTransaction: TronTransaction,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    const operations = [this.allWalletsValid, this.afterOrder, this.equalOrderAmount];
    let data = this.notFailTronTransaction(tronTransaction);
    // Exit early if the transaction failed
    if (!data.isValid) {
      return data;
    }
    for (const operation of operations) {
      // Only proceed if the previous result was successful
      if (data.isValid) {
        data = operation.call(this, tronTransaction, transaction);
      } else {
        // Exit loop early if a failure is encountered
        break;
      }
    }
    return data;
  }

  private notFailTronTransaction(tronTransaction: TronTransaction): ValidateCryptoTransactionResult {
    return {
      isValid: tronTransaction?.status !== TransactionStatus.FAILED,
      errorCode: TransactionFailCode.TRANSACTION_SEND_FAILED,
    };
  }

  private allWalletsValid(
    tronTransaction: TronTransaction,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    return this.validateTronWalletAddress(tronTransaction, transaction);
  }

  private afterOrder(
    tronTransaction: TronTransaction,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    return {
      isValid: !moment(tronTransaction.createdAt).isBefore(transaction.order.createdAt),
      errorCode: TransactionFailCode.INVALID_TIME_SEND,
    };
  }

  private equalOrderAmount(
    tronTransaction: TronTransaction,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    return {
      isValid: BigNumber(tronTransaction.amount).isEqualTo(transaction.order.amount),
      errorCode: TransactionFailCode.INVALID_AMOUNT,
    };
  }

  private validateTronWalletAddress(
    tronTransaction: TronTransaction,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    const contractAsset = transaction.order?.asset?.contract || null;

    // Native
    if (!contractAsset && tronTransaction.to !== this.getWalletAddressReceiverByOrder(transaction.order)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
      };
    }

    // None Native
    if (contractAsset) {
      if (tronTransaction.to !== this.getWalletAddressReceiverByOrder(transaction.order)) {
        return {
          isValid: false,
          errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
        };
      }
      if (tronTransaction.from !== this.getWalletAddressSenderByOrder(transaction.order)) {
        return {
          isValid: false,
          errorCode: TransactionFailCode.INVALID_ADDRESS_SEND,
        };
      }
    }

    return {
      isValid: true,
      errorCode: null,
    };
  }

  private async createMissingCryptoTransactionStatuses(transaction: CryptoTransaction) {
    if (
      (!transaction.cryptoTransactionStatus || transaction.cryptoTransactionStatus.length === 0) &&
      ((transaction.order.type === TradeType.BUY &&
        transaction.order.step === BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT) ||
        (transaction.order.type === TradeType.SELL &&
          transaction.order.step === SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER))
    ) {
      transaction.cryptoTransactionStatus = await this.cryptoTransactionService.createCryptoTransactionStatuses(
        transaction
      );
    }
  }

  @Spanning()
  private async checkETHTransactionReceipt(transaction: CryptoTransaction) {
    let result = null;
    const orderLifecycleService =
      transaction.order.type === TradeType.BUY
        ? this.systemBuyOrderLifecycleService
        : this.systemSellOrderLifecycleService;

    await this.createMissingCryptoTransactionStatuses(transaction);
    let failCode = null;
    await Promise.all(
      transaction.cryptoTransactionStatus.map(async (cryptoTransactionStatus) => {
        try {
          const transactionReceipt = await this.blockChainTransactionService.getTransactionReceipt(
            transaction.hash,
            transaction.order.asset.network,
            cryptoTransactionStatus.rpc
          );
          let cryptoTransactionResponse: ValidateCryptoTransactionResult = null;
          if (transactionReceipt && transactionReceipt.blockNumber !== 0) {
            cryptoTransactionResponse = this.validateWalletAddress(transactionReceipt, transaction);
            if (!cryptoTransactionResponse?.isValid) {
              cryptoTransactionStatus.status = TransactionStatus.FAILED;
              transaction.failCode = cryptoTransactionResponse?.errorCode;
              failCode = cryptoTransactionResponse?.errorCode;
            } else {
              cryptoTransactionResponse = await this.validateNativeOrERC20Token(
                transactionReceipt,
                transaction,
                cryptoTransactionStatus
              );
              if (!cryptoTransactionResponse?.isValid) {
                cryptoTransactionStatus.status = TransactionStatus.FAILED;
                transaction.failCode = cryptoTransactionResponse?.errorCode;
                failCode = cryptoTransactionResponse?.errorCode;
              } else {
                cryptoTransactionStatus.status = TransactionStatus.SUCCEED;
              }
            }
          }
        } catch (error: any) {
          if (error?.code === 'TIMEOUT') {
            cryptoTransactionStatus.status = TransactionStatus.UNKNOWN;
            transaction.failCode = TransactionFailCode.RPC_TIMEOUT;
          } else {
            cryptoTransactionStatus.status = TransactionStatus.UNKNOWN;
            transaction.failCode = TransactionFailCode.RPC_UNKNOW_ERROR;
          }
        }
        return cryptoTransactionStatus;
      })
    );
    if (transaction.cryptoTransactionStatus.some((item) => item.status === TransactionStatus.SUCCEED)) {
      transaction.status = TransactionStatus.SUCCEED;
      result = await orderLifecycleService.updateTransactionStatus(transaction);
    } else if (this.isTransactionFailed(transaction)) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failCode = failCode || transaction.failCode;
      result = await orderLifecycleService.updateTransactionStatus(transaction);
    } else if (this.isAllTransactionStatusMatch(transaction, TransactionStatus.UNKNOWN)) {
      result = await this.systemSellOrderLifecycleService.updateTransactionUnknownStatus(transaction);
    } else if (await this.transactionMinutesTimeout(transaction)) {
      // A transaction status is unknown and the rest is pending
      if (transaction.cryptoTransactionStatus.some((item) => item.status === TransactionStatus.UNKNOWN)) {
        result = await this.systemSellOrderLifecycleService.updateTransactionUnknownStatus(transaction);
      } else {
        transaction.status = TransactionStatus.FAILED;
        transaction.failCode = TransactionFailCode.TRANSACTION_TIMEOUT;
        result = await orderLifecycleService.updateTransactionStatus(transaction);
      }
    }

    this.checkAndCleanProcess(result, transaction);
  }

  private isTransactionFailed(transaction: CryptoTransaction): boolean {
    const allFailed = this.isAllTransactionStatusMatch(transaction, TransactionStatus.FAILED);
    const unknownAndFailed =
      transaction.cryptoTransactionStatus.some((item) => item.status === TransactionStatus.UNKNOWN) &&
      transaction.cryptoTransactionStatus.some((item) => item.status === TransactionStatus.FAILED);
    return transaction.cryptoTransactionStatus.length && (allFailed || unknownAndFailed);
  }

  private isAllTransactionStatusMatch(transaction: CryptoTransaction, status: TransactionStatus): boolean {
    return (
      transaction.cryptoTransactionStatus.length &&
      transaction.cryptoTransactionStatus.every((item) => item.status === status)
    );
  }

  private async validateNativeOrERC20Token(
    transactionReceipt: any,
    transaction: CryptoTransaction,
    cryptoTransactionStatus: CryptoTransactionStatus
  ): Promise<ValidateCryptoTransactionResult> {
    const isNaviteToken = await this.blockChainTransactionService.isNativeToken(
      transaction.hash,
      transaction.order.asset.network,
      cryptoTransactionStatus.rpc
    );
    if (isNaviteToken) {
      return await this.validateNativeTransaction(transactionReceipt, transaction, cryptoTransactionStatus);
    }
    return await this.validateERC20Transaction(transactionReceipt, transaction, cryptoTransactionStatus);
  }

  private checkAndCleanProcess(result: any, transaction: any) {
    if (
      result &&
      (result.data ||
        (result.errors && result.errors[0].key !== CryptoTransactionError.SYSTEM_UPDATE_STATUS_FAILED.key))
    ) {
      this.transactionProcessMap.delete(transaction.id);
    }
  }

  private getWorkerOpts() {
    return {
      ...this.bullConfig,
      lockDuration: 90000,
      concurrency: 200,
    };
  }

  private async validateNativeTransaction(
    transactionReceipt: any,
    transaction: CryptoTransaction,
    cryptoTransactionStatus: CryptoTransactionStatus
  ): Promise<ValidateCryptoTransactionResult> {
    if (transactionReceipt?.from !== this.getWalletAddressSenderByOrder(transaction.order)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_SEND,
      };
    }

    if (transactionReceipt?.to !== this.getWalletAddressReceiverByOrder(transaction.order)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
      };
    }

    const transactionCreatedAt = await this.blockChainTransactionService.getTransactionCreatedAt(
      transaction.hash,
      transaction.order.asset.network,
      cryptoTransactionStatus.rpc
    );

    if (moment(transactionCreatedAt).isBefore(transaction.order.createdAt)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_TIME_SEND,
      };
    }

    if (transaction.order.isCompareIncorrectAmount(transactionReceipt?.value)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_AMOUNT,
      };
    }

    return {
      isValid: transactionReceipt.status === TRANSACTION_RECEIPT_STATUS_TYPE.SUCCESS,
      errorCode: null,
    };
  }

  private async validateERC20Transaction(
    transactionReceipt: any,
    transaction: CryptoTransaction,
    cryptoTransactionStatus: CryptoTransactionStatus
  ): Promise<ValidateCryptoTransactionResult> {
    const transactionCreatedAt = await this.blockChainTransactionService.getTransactionCreatedAt(
      transaction.hash,
      transaction.order.asset.network,
      cryptoTransactionStatus.rpc
    );

    if (moment(transactionCreatedAt).isBefore(transaction.order.createdAt)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_TIME_SEND,
      };
    }
    const transferLogs = this.blockChainTransactionService.getTransactionTransferLogs(transactionReceipt?.logs);

    if (transferLogs?.length) {
      const validateLogs = await Promise.all(
        transferLogs.map((log) => {
          return this.validateTransactionLog(log, transaction.order, cryptoTransactionStatus.rpc);
        })
      );

      const failLog = validateLogs.find((e) => e.isValid === false);
      if (failLog) {
        return {
          isValid: false,
          errorCode: validateLogs[0].errorCode,
        };
      }
    }
    return {
      isValid: transactionReceipt.status === TRANSACTION_RECEIPT_STATUS_TYPE.SUCCESS,
      errorCode: TransactionFailCode.TRANSACTION_SEND_FAILED,
    };
  }

  private async validateTransactionLog(log: any, order: Order, rpc: string): Promise<ValidateCryptoTransactionResult> {
    const decimal = await this.blockChainTransactionService.getDecimal(order.asset, rpc);
    const amount = this.blockChainTransactionService.convertWeiToUnit(log.args['value'], decimal);
    if (log.args['to'] !== this.getWalletAddressReceiverByOrder(order)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
      };
    }
    if (log.args['from'] !== this.getWalletAddressSenderByOrder(order)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_SEND,
      };
    }
    if (!BigNumber(amount).isEqualTo(order.amount)) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_AMOUNT,
      };
    }
    return {
      isValid: true,
      errorCode: null,
    };
  }

  private validateWalletAddress(
    transactionReceipt: providers.TransactionReceipt,
    transaction: CryptoTransaction
  ): ValidateCryptoTransactionResult {
    const contractAsset = transaction.order?.asset?.contract || null;
    // with ERC20 token
    if (!!contractAsset && transactionReceipt.to !== contractAsset) {
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
      };
    } else if (!contractAsset && transactionReceipt.to !== this.getWalletAddressReceiverByOrder(transaction.order)) {
      // with Native token
      return {
        isValid: false,
        errorCode: TransactionFailCode.INVALID_ADDRESS_RECEIVE,
      };
    }
    return {
      isValid: true,
      errorCode: null,
    };
  }

  private getWalletAddressReceiverByOrder(order: Order) {
    return order.type === TradeType.SELL ? order.merchant.walletAddress : order.user.walletAddress;
  }

  private getWalletAddressSenderByOrder(order: Order) {
    return order.type === TradeType.SELL ? order.user.walletAddress : order.merchant.walletAddress;
  }

  private async transactionMinutesTimeout(transaction: CryptoTransaction) {
    const masterData = await this.sharedMasterDataService.getLatestMasterDataCommon();
    const cryptoSendingWaitTimeLimit =
      transaction.order?.configuration?.cryptoSendingWaitTimeLimit || masterData.cryptoSendingWaitTimeLimit;
    const expiredAt = moment(transaction.createdAt).add(cryptoSendingWaitTimeLimit, 'minutes');
    return moment().isAfter(expiredAt);
  }
}
