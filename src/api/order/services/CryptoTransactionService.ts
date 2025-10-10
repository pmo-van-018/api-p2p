import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { SELL_ORDER_MAX_RETRY_SEND_CRYPTO } from '@api/common/models/P2PConstant';
import { BLOCKCHAIN_NETWORKS } from '@api/common/models/P2PEnum';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { CryptoTransactionStatus } from '@api/order/models/CryptoTransactionStatus';
import { CryptoTransactionRepository } from '@api/order/repositories/CryptoTransactionRepository';
import { CryptoTransactionStatusRepository } from '@api/order/repositories/CryptoTransactionStatusRepository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Spanning } from '@base/decorators/Tracing';
import { env } from '@base/env';
import { deleteCache, getCache, setCache } from '@base/utils/redis-client';
import { FindConditions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import moment from 'moment';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { events } from '@api/subscribers/events';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class CryptoTransactionService {
  private readonly rpcByNetwork = new Map<BLOCKCHAIN_NETWORKS, string[]>();

  constructor(
    @InjectRepository() private cryptoTransactionRepository: CryptoTransactionRepository,
    @InjectRepository() private cryptoTransactionStatusRepository: CryptoTransactionStatusRepository,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
    this.loadRpcByNetwork();
  }

  public async submitCryptoTransaction(
    orderId: string,
    hash: string,
    network: BLOCKCHAIN_NETWORKS
  ): Promise<CryptoTransaction> {
    const cryptoTransaction = new CryptoTransaction();
    cryptoTransaction.orderId = orderId;
    cryptoTransaction.hash = hash;
    cryptoTransaction.status = TransactionStatus.PENDING;
    cryptoTransaction.network = network;

    cryptoTransaction.cryptoTransactionStatus = this.attachRpcTransactionStatusesToTransaction(cryptoTransaction);
    return await this.cryptoTransactionRepository.save(cryptoTransaction);
  }

  public async createCryptoTransactionStatuses(transaction: CryptoTransaction): Promise<CryptoTransactionStatus[]> {
    const cryptoTransactionStatus = this.attachRpcTransactionStatusesToTransaction(transaction);
    return await this.cryptoTransactionStatusRepository.save(cryptoTransactionStatus);
  }

  public async saveCryptoTransactionStatus(cryptoTransactionStatus: CryptoTransactionStatus[]) {
    await this.cryptoTransactionStatusRepository.save(cryptoTransactionStatus);
  }

  @Spanning()
  public async getPendingListByWorker() {
    try {
      return await this.cryptoTransactionRepository.getPendingTransactions();
    } catch (error: any) {
      this.log.error(error.message ?? error);
    }
    return null;
  }

  public async getByIdAndOrderId(id: string, orderId: string) {
    try {
      return await this.cryptoTransactionRepository.findOneOrFail({ id, orderId });
    } catch (error: any) {
      this.log.error(error.message ?? null);
    }
    return null;
  }

  public async submitTransactionLimiter(orderId: string) {
    const key = this.getKeyCacheLimiter(orderId);
    const time: number = await getCache(key);
    if (!time) {
      await setCache(key, 1);
      return SELL_ORDER_MAX_RETRY_SEND_CRYPTO - 1;
    }
    const nextTime = time + 1;
    if (nextTime >= SELL_ORDER_MAX_RETRY_SEND_CRYPTO) {
      await deleteCache(key);
      return -1;
    }
    await setCache(key, nextTime);
    return SELL_ORDER_MAX_RETRY_SEND_CRYPTO - nextTime;
  }

  public async deleteLimiter(orderId: string) {
    const key = this.getKeyCacheLimiter(orderId);
    await deleteCache(key);
  }

  public async findOneWithConditions(
    conditions: FindConditions<CryptoTransaction>,
    options?: FindOneOptions<CryptoTransaction>
  ): Promise<CryptoTransaction> {
    return await this.cryptoTransactionRepository.findOne(conditions, options);
  }

  public async save(cryptoTransaction: CryptoTransaction): Promise<CryptoTransaction | null> {
    try {
      return await this.cryptoTransactionRepository.save(cryptoTransaction);
    } catch (error: any) {
      this.log.error(error.message ?? error);
    }
    return null;
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<CryptoTransaction>): Promise<number | null> {
    try {
      const updateResult = await this.cryptoTransactionRepository.update(id, partialEntity);
      return updateResult.affected;
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw error;
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async handleMissingTransaction() {
    this.log.info('Start handle missing transaction job');
    const missingTime = moment().subtract(env.cryptoTransaction.missingTransactionMinutes, 'minutes').toDate();
    const transactions = await this.cryptoTransactionRepository.getPendingTransactions({
      lessThanDate: missingTime,
    });
    if (!transactions.length) {
      this.log.info('No missing transaction found');
      return;
    }
    const transactionIds = transactions.map((transaction) => transaction.id);
    this.eventDispatcher.dispatch(events.actions.cryptoTransaction.missingTransaction, transactionIds);
    this.log.info('End handle missing transaction job');
  }

  public async getTransactionsByIds(ids: string[]): Promise<CryptoTransaction[]> {
    return await this.cryptoTransactionRepository.findByIds(ids, {
      relations: ['order', 'order.asset', 'order.user', 'order.merchant', 'cryptoTransactionStatus'],
    });
  }

  private loadRpcByNetwork() {
    // Load rpc by network
    Object.values(BLOCKCHAIN_NETWORKS).forEach((network) => {
      if (network === BLOCKCHAIN_NETWORKS.TRON) {
        this.rpcByNetwork.set(network, [env.tronlink.fullHost]);
      } else {
        // Fallback to evm rpc
        const rpcsByChain: string[] = env.rpc[String(network).toLowerCase()];

        if (!rpcsByChain) {
          return;
        }
        this.rpcByNetwork.set(network, rpcsByChain);
      }
    });
  }

  /**
   * Method to generate RpcTransactionStatuses and attach to CryptoTransaction
   *
   * @param transaction CryptoTransaction
   */
  private attachRpcTransactionStatusesToTransaction(transaction: CryptoTransaction) {
    return (
      this.rpcByNetwork.get(transaction.network)?.map((rpc) => {
        const cryptoTransactionStatus = new CryptoTransactionStatus();
        cryptoTransactionStatus.rpc = rpc;
        cryptoTransactionStatus.status = TransactionStatus.PENDING;
        return cryptoTransactionStatus;
      }) ?? []
    );
  }

  private getKeyCacheLimiter(orderId: string) {
    return `submmit_transaction_limiter_${orderId}`;
  }
}
