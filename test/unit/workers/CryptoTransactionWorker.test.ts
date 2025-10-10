import 'dotenv/config';
import moment from 'moment';

import { plainToInstance } from 'class-transformer';
import { BLOCKCHAIN_NETWORKS, TradeType } from '../../../src/api/common/models';
import { SharedMasterDataService } from '../../../src/api/master-data/services/SharedMasterDataService';
import { CryptoTransactionError } from '../../../src/api/order/errors/CryptoTransactionError';
import { CryptoTransaction, TransactionStatus } from '../../../src/api/order/models/CryptoTransaction';
import { BUY_ORDER_STEPS, SELL_ORDER_STEP } from '../../../src/api/order/models/Order';
import { BlockchainTransactionService } from '../../../src/api/order/services/BlockchainTransactionService';
import { CryptoTransactionService } from '../../../src/api/order/services/CryptoTransactionService';
import { SystemOrderLifecycleService } from '../../../src/api/order/services/order/buy/SystemOrderLifecycleService';
import * as tronFn from '../../../src/api/order/services/tron.fn';
import CryptoTransactionWorker from '../../../src/api/workers/CryptoTransactionWorker';
import { WorkerConfig } from '../../../src/api/workers/WorkerConfig';
import { LoggerInterface } from '../../../src/utils/logger/LoggerInterface';

describe('CryptoTransactionWorker', () => {
  let cryptoTransactionWorker: CryptoTransactionWorker;

  beforeAll(async () => {
    const log: LoggerInterface = { debug: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn() }; // Mock this as needed
    const sharedMasterDataService = new SharedMasterDataService({}, {});

    const workerConfig = new WorkerConfig(); // Mock this as needed
    const cryptoTransactionService = new CryptoTransactionService({}, {}, log);
    const systemBuyOrderLifecycleService = new SystemOrderLifecycleService({}, {}, {}, {}, {}, {});
    const systemSellOrderLifecycleService = {}; // Mock this as needed
    const blockChainTransactionService = new BlockchainTransactionService({});
    cryptoTransactionWorker = new CryptoTransactionWorker(
      log,
      workerConfig,
      cryptoTransactionService,
      systemBuyOrderLifecycleService,
      systemSellOrderLifecycleService,
      blockChainTransactionService,
      sharedMasterDataService
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkTRONransactionReceipt', () => {
    let transaction: CryptoTransaction;
    let tronTransaction: any;

    beforeEach(() => {
      transaction = {
        order: {
          type: TradeType.BUY,
          asset: {
            network: BLOCKCHAIN_NETWORKS.TRON,
          },
        },
        hash: 'hash',
        cryptoTransactionStatus: [{ rpc: 'rpc', status: TransactionStatus.PENDING }],
      } as CryptoTransaction;

      tronTransaction = {};

      jest.spyOn(cryptoTransactionWorker as any, 'createMissingCryptoTransactionStatuses').mockResolvedValue(undefined);
      jest.spyOn(tronFn, 'getTronTransaction').mockResolvedValue(tronTransaction);
      jest.spyOn(cryptoTransactionWorker as any, 'validateTronTransaction').mockReturnValue(true);
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(false);
      jest.spyOn(cryptoTransactionWorker as any, 'checkAndCleanProcess').mockImplementation();
    });

    it('should update transaction status to SUCCEED if validateTronTransaction returns true and not timeout', async () => {
      jest
        .spyOn((cryptoTransactionWorker as any).systemBuyOrderLifecycleService, 'updateTransactionStatus')
        .mockImplementation();

      await (cryptoTransactionWorker as any).checkTRONransactionReceipt(transaction);

      expect(transaction.status).toBe(TransactionStatus.SUCCEED);
    });

    it('should update transaction status to FAILED if validateTronTransaction returns false and timeout', async () => {
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(true);
      jest.spyOn(cryptoTransactionWorker as any, 'validateTronTransaction').mockReturnValue(false);
      jest
        .spyOn((cryptoTransactionWorker as any).systemBuyOrderLifecycleService, 'updateTransactionStatus')
        .mockImplementation();

      await (cryptoTransactionWorker as any).checkTRONransactionReceipt(transaction);

      expect(transaction.status).toBe(TransactionStatus.FAILED);
    });

    it('should update transaction status to FAILED if transaction minutes timeout', async () => {
      jest.spyOn(tronFn, 'getTronTransaction').mockResolvedValue(null);
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(true);
      jest
        .spyOn((cryptoTransactionWorker as any).systemBuyOrderLifecycleService, 'updateTransactionStatus')
        .mockImplementation();

      await (cryptoTransactionWorker as any).checkTRONransactionReceipt(transaction);

      expect(transaction.status).toBe(TransactionStatus.FAILED);
    });

    it('should set cryptoTransactionStatus status to FAILED if an error occurs and timeout', async () => {
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(true);
      jest.spyOn(tronFn, 'getTronTransaction').mockRejectedValue(new Error());
      jest
        .spyOn((cryptoTransactionWorker as any).systemBuyOrderLifecycleService, 'updateTransactionStatus')
        .mockImplementation();

      await (cryptoTransactionWorker as any).checkTRONransactionReceipt(transaction);

      expect(transaction.cryptoTransactionStatus[0].status).toBe(TransactionStatus.FAILED);
    });
  });

  describe('checkETHTransactionReceipt', () => {
    let transaction: CryptoTransaction;
    let transactionReceipt: any;
    let isNaviteToken: boolean;

    beforeEach(() => {
      transaction = {
        order: {
          type: TradeType.BUY,
          asset: {
            network: BLOCKCHAIN_NETWORKS.BSC,
          },
        },
        hash: 'hash',
        cryptoTransactionStatus: [
          {
            rpc: 'rpc',
            status: TransactionStatus.PENDING,
          },
        ],
      } as CryptoTransaction;

      transactionReceipt = {
        blockNumber: 1,
      };

      isNaviteToken = false;

      jest.spyOn(cryptoTransactionWorker as any, 'createMissingCryptoTransactionStatuses').mockResolvedValue(undefined);
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'getTransactionReceipt')
        .mockResolvedValue(transactionReceipt);
      jest
        .spyOn(cryptoTransactionWorker as any, 'validateWalletAddress')
        .mockImplementation((_, __, cryptoTransactionStatus) => cryptoTransactionStatus);
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'isNaviteToken')
        .mockResolvedValue(isNaviteToken);
      jest
        .spyOn(cryptoTransactionWorker as any, 'validateNativeTransaction')
        .mockImplementation((_, __, cryptoTransactionStatus) => cryptoTransactionStatus);
      jest
        .spyOn(cryptoTransactionWorker as any, 'validateERC20Transaction')
        .mockResolvedValue(transaction.cryptoTransactionStatus[0]);
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(false);
      jest.spyOn(cryptoTransactionWorker as any, 'checkAndCleanProcess').mockImplementation();
    });

    it('should update transaction status to SUCCEED if any cryptoTransactionStatus is SUCCEED', async () => {
      transaction.cryptoTransactionStatus[0].status = TransactionStatus.SUCCEED;

      jest
        .spyOn(
          (cryptoTransactionWorker as any).systemBuyOrderLifecycleService as SystemOrderLifecycleService,
          'updateTransactionStatus'
        )
        .mockImplementation();
      await (cryptoTransactionWorker as any).checkETHTransactionReceipt(transaction);
      expect(transaction.status).toBe(TransactionStatus.SUCCEED);
    });

    it('should update transaction status to FAILED if transaction minutes timeout', async () => {
      jest.spyOn(cryptoTransactionWorker as any, 'transactionMinutesTimeout').mockResolvedValue(true);

      jest
        .spyOn(
          (cryptoTransactionWorker as any).systemBuyOrderLifecycleService as SystemOrderLifecycleService,
          'updateTransactionStatus'
        )
        .mockImplementation();
      await (cryptoTransactionWorker as any).checkETHTransactionReceipt(transaction);

      expect(transaction.status).toBe(TransactionStatus.FAILED);
    });

    it('should validate ERC20 transaction if isNaviteToken is false', async () => {
      await (cryptoTransactionWorker as any).checkETHTransactionReceipt(transaction);

      expect((cryptoTransactionWorker as any).blockChainTransactionService.isNaviteToken).toHaveBeenCalledWith(
        transaction.hash,
        transaction.order.asset.network,
        transaction.cryptoTransactionStatus[0].rpc
      );
      expect(cryptoTransactionWorker['validateERC20Transaction']).toHaveBeenCalledWith(
        transactionReceipt,
        transaction,
        transaction.cryptoTransactionStatus[0]
      );
    });

    it('should set cryptoTransactionStatus status to FAILED if an error occurs', async () => {
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'getTransactionReceipt')
        .mockRejectedValue(new Error());

      await (cryptoTransactionWorker as any).checkETHTransactionReceipt(transaction);

      expect(transaction.cryptoTransactionStatus[0].status).toBe(TransactionStatus.FAILED);
    });
  });

  describe('handleMerchantSubmitTransactionOrderBuy', () => {
    it('should add the cryptoTransaction to the transactionProcessMap', async () => {
      const cryptoTransaction = { id: 'a', status: TransactionStatus.PENDING };

      await (cryptoTransactionWorker as any).handleMerchantSubmitTransactionOrderBuy({ cryptoTransaction });

      expect(cryptoTransactionWorker.transactionProcessMap.has(cryptoTransaction.id)).toBe(true);
      expect(cryptoTransactionWorker.transactionProcessMap.get(cryptoTransaction.id)).toEqual(
        plainToInstance(CryptoTransaction, cryptoTransaction)
      );
    });

    it('should overwrite the existing cryptoTransaction in the transactionProcessMap if the id is the same', async () => {
      const cryptoTransaction1 = { id: 'a', status: TransactionStatus.PENDING };
      const cryptoTransaction2 = { id: 'a', status: TransactionStatus.SUCCEED };

      await (cryptoTransactionWorker as any).handleMerchantSubmitTransactionOrderBuy({
        cryptoTransaction: cryptoTransaction1,
      });
      await (cryptoTransactionWorker as any).handleMerchantSubmitTransactionOrderBuy({
        cryptoTransaction: cryptoTransaction2,
      });

      expect(cryptoTransactionWorker.transactionProcessMap.has(cryptoTransaction1.id)).toBe(true);
      expect(cryptoTransactionWorker.transactionProcessMap.get(cryptoTransaction1.id)).toEqual(
        plainToInstance(CryptoTransaction, cryptoTransaction2)
      );
    });
  });

  describe('handleUserSubmitTransactionOrderSell', () => {
    it('should add the cryptoTransaction to the transactionProcessMap', async () => {
      const cryptoTransaction = { id: 'a', status: TransactionStatus.PENDING };

      await (cryptoTransactionWorker as any).handleUserSubmitTransactionOrderSell({ cryptoTransaction });

      expect(cryptoTransactionWorker.transactionProcessMap.has(cryptoTransaction.id)).toBe(true);
      expect(cryptoTransactionWorker.transactionProcessMap.get(cryptoTransaction.id)).toEqual(
        plainToInstance(CryptoTransaction, cryptoTransaction)
      );
    });

    it('should overwrite the existing cryptoTransaction in the transactionProcessMap if the id is the same', async () => {
      const cryptoTransaction1 = { id: 'a', status: TransactionStatus.PENDING };
      const cryptoTransaction2 = { id: 'a', status: TransactionStatus.SUCCEED };

      await (cryptoTransactionWorker as any).handleUserSubmitTransactionOrderSell({
        cryptoTransaction: cryptoTransaction1,
      });
      await (cryptoTransactionWorker as any).handleUserSubmitTransactionOrderSell({
        cryptoTransaction: cryptoTransaction2,
      });

      expect(cryptoTransactionWorker.transactionProcessMap.has(cryptoTransaction1.id)).toBe(true);
      expect(cryptoTransactionWorker.transactionProcessMap.get(cryptoTransaction1.id)).toEqual(
        plainToInstance(CryptoTransaction, cryptoTransaction2)
      );
    });
  });

  describe('checkTransactionStatus', () => {
    it('should process all pending transactions', async () => {
      const transactions = [
        { id: 'a', status: TransactionStatus.PENDING },
        { id: 'b', status: TransactionStatus.PENDING },
        { id: 'c', status: TransactionStatus.SUCCEED },
      ];

      transactions.forEach((transaction) => {
        cryptoTransactionWorker.transactionProcessMap.set(transaction.id, { status: transaction.status });
      });

      const checkTransactionReceiptSpy = jest.spyOn(cryptoTransactionWorker as any, 'checkTransactionReceipt');

      await (cryptoTransactionWorker as any).checkTransactionStatus();

      expect(checkTransactionReceiptSpy).toHaveBeenCalledTimes(2);
      expect(cryptoTransactionWorker['done']).toBe(true);
    });

    it('should not process any transactions if there are no pending transactions', async () => {
      const transactions = [
        { id: 'a', status: TransactionStatus.SUCCEED },
        { id: 'b', status: TransactionStatus.SUCCEED },
      ];

      transactions.forEach((transaction) => {
        cryptoTransactionWorker.transactionProcessMap.set(transaction.id, { status: transaction.status });
      });

      const checkTransactionReceiptSpy = jest.spyOn(cryptoTransactionWorker as any, 'checkTransactionReceipt');

      await (cryptoTransactionWorker as any).checkTransactionStatus();

      expect(checkTransactionReceiptSpy).not.toHaveBeenCalled();
      expect(cryptoTransactionWorker['done']).toBe(true);
    });
  });

  describe('validateTronTransaction', () => {
    it('should return false if tronTransaction status is FAILED', () => {
      const tronTransaction = { status: TransactionStatus.FAILED, createdAt: new Date(), amount: '10' };
      const transaction = { order: { createdAt: new Date(), amount: '10' } };

      const result = (cryptoTransactionWorker as any).validateTronTransaction(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return false if validateTronWalletAddress returns false', () => {
      const tronTransaction = { status: TransactionStatus.SUCCEED, createdAt: new Date(), amount: '10' };
      const transaction = { order: { createdAt: new Date(), amount: '10' } };

      jest.spyOn(cryptoTransactionWorker as any, 'validateTronWalletAddress').mockReturnValue(false);

      const result = (cryptoTransactionWorker as any).validateTronTransaction(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return false if tronTransaction createdAt is before order createdAt', () => {
      const tronTransaction = {
        status: TransactionStatus.SUCCEED,
        createdAt: moment().subtract(1, 'hours').toDate(),
        amount: '10',
      };
      const transaction = { order: { createdAt: new Date(), amount: '10' } };

      jest.spyOn(cryptoTransactionWorker as any, 'validateTronWalletAddress').mockReturnValue(true);

      const result = (cryptoTransactionWorker as any).validateTronTransaction(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return false if tronTransaction amount is not equal to order amount', () => {
      const tronTransaction = { status: TransactionStatus.SUCCEED, createdAt: new Date(), amount: '10' };
      const transaction = { order: { createdAt: new Date(), amount: '20' } };

      jest.spyOn(cryptoTransactionWorker as any, 'validateTronWalletAddress').mockReturnValue(true);

      const result = (cryptoTransactionWorker as any).validateTronTransaction(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return true if all conditions are met', () => {
      const tronTransaction = { status: TransactionStatus.SUCCEED, createdAt: new Date(), amount: '10' };
      const transaction = { order: { createdAt: new Date(), amount: '10' } };

      jest.spyOn(cryptoTransactionWorker as any, 'validateTronWalletAddress').mockReturnValue(true);

      const result = (cryptoTransactionWorker as any).validateTronTransaction(tronTransaction, transaction);

      expect(result).toBe(true);
    });
  });

  describe('validateTronWalletAddress', () => {
    it('should return false if transaction is native and tronTransaction.to does not match receiver wallet address', () => {
      const tronTransaction = { to: 'otherWallet' };
      const transaction = {
        order: {
          asset: null,
        },
      };

      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressReceiverByOrder').mockReturnValue('receiverWallet');

      const result = (cryptoTransactionWorker as any).validateTronWalletAddress(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return true if transaction is native and tronTransaction.to matches receiver wallet address', () => {
      const tronTransaction = { to: 'receiverWallet' };
      const transaction = {
        order: {
          asset: null,
        },
      };

      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressReceiverByOrder').mockReturnValue('receiverWallet');

      const result = (cryptoTransactionWorker as any).validateTronWalletAddress(tronTransaction, transaction);

      expect(result).toBe(true);
    });

    it('should return false if transaction is not native and tronTransaction.to does not match receiver wallet address', () => {
      const tronTransaction = { to: 'otherWallet', from: 'senderWallet' };
      const transaction = {
        order: {
          asset: { contract: 'contract' },
        },
      };

      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressReceiverByOrder').mockReturnValue('receiverWallet');
      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressSenderByOrder').mockReturnValue('senderWallet');

      const result = (cryptoTransactionWorker as any).validateTronWalletAddress(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return false if transaction is not native and tronTransaction.from does not match sender wallet address', () => {
      const tronTransaction = { to: 'receiverWallet', from: 'otherWallet' };
      const transaction = {
        order: {
          asset: { contract: 'contract' },
        },
      };

      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressReceiverByOrder').mockReturnValue('receiverWallet');
      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressSenderByOrder').mockReturnValue('senderWallet');

      const result = (cryptoTransactionWorker as any).validateTronWalletAddress(tronTransaction, transaction);

      expect(result).toBe(false);
    });

    it('should return true if transaction is not native and tronTransaction.to matches receiver wallet address and tronTransaction.from matches sender wallet address', () => {
      const tronTransaction = { to: 'receiverWallet', from: 'senderWallet' };
      const transaction = {
        order: {
          asset: { contract: 'contract' },
        },
      };

      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressReceiverByOrder').mockReturnValue('receiverWallet');
      jest.spyOn(cryptoTransactionWorker as any, 'getWalletAddressSenderByOrder').mockReturnValue('senderWallet');

      const result = (cryptoTransactionWorker as any).validateTronWalletAddress(tronTransaction, transaction);

      expect(result).toBe(true);
    });
  });

  describe('createMissingCryptoTransactionStatuses', () => {
    it('should create crypto transaction statuses if none exist and order type is BUY and step is BUY_SENDING_CRYPTO_BY_MERCHANT', async () => {
      const transaction = {
        cryptoTransactionStatus: [],
        order: {
          type: TradeType.BUY,
          step: BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
        },
      };

      jest
        .spyOn((cryptoTransactionWorker as any).cryptoTransactionService, 'createCryptoTransactionStatuses')
        .mockResolvedValue({});

      await (cryptoTransactionWorker as any).createMissingCryptoTransactionStatuses(transaction);

      expect(
        (cryptoTransactionWorker as any).cryptoTransactionService.createCryptoTransactionStatuses
      ).toHaveBeenCalledWith(transaction);
    });

    it('should create crypto transaction statuses if none exist and order type is SELL and step is SELL_SENDING_CRYPTO_BY_USER', async () => {
      const transaction = {
        cryptoTransactionStatus: [],
        order: {
          type: TradeType.SELL,
          step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
        },
      };

      jest
        .spyOn((cryptoTransactionWorker as any).cryptoTransactionService, 'createCryptoTransactionStatuses')
        .mockResolvedValue({});

      await (cryptoTransactionWorker as any).createMissingCryptoTransactionStatuses(transaction);

      expect(
        (cryptoTransactionWorker as any).cryptoTransactionService.createCryptoTransactionStatuses
      ).toHaveBeenCalledWith(transaction);
    });

    it('should not create crypto transaction statuses if they already exist', async () => {
      const transaction = {
        cryptoTransactionStatus: [{}],
        order: {
          type: TradeType.BUY,
          step: BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
        },
      };

      jest.spyOn((cryptoTransactionWorker as any).cryptoTransactionService, 'createCryptoTransactionStatuses');

      await (cryptoTransactionWorker as any).createMissingCryptoTransactionStatuses(transaction);

      expect(
        (cryptoTransactionWorker as any).cryptoTransactionService.createCryptoTransactionStatuses
      ).not.toHaveBeenCalled();
    });

    it('should not create crypto transaction statuses if order type and step do not match the required conditions', async () => {
      const transaction = {
        cryptoTransactionStatus: [],
        order: {
          type: TradeType.BUY,
          step: 'someOtherStep',
        },
      };

      jest.spyOn((cryptoTransactionWorker as any).cryptoTransactionService, 'createCryptoTransactionStatuses');

      await (cryptoTransactionWorker as any).createMissingCryptoTransactionStatuses(transaction);

      expect(
        (cryptoTransactionWorker as any).cryptoTransactionService.createCryptoTransactionStatuses
      ).not.toHaveBeenCalled();
    });
  });

  describe('checkAndCleanProcess', () => {
    it('should remove transaction from transactionProcessMap if result is not null and result.data is present', () => {
      const result = { data: {} };
      const transaction = { id: 'transaction1' };
      (cryptoTransactionWorker as any).transactionProcessMap.set(transaction.id, {});

      (cryptoTransactionWorker as any).checkAndCleanProcess(result, transaction);

      expect((cryptoTransactionWorker as any).transactionProcessMap.has(transaction.id)).toBe(false);
    });

    it('should remove transaction from transactionProcessMap if result is not null and result.errors is present with a key not equal to SYSTEM_UPDATE_STATUS_FAILED', () => {
      const result = { errors: [{ key: 'SomeOtherError' }] };
      const transaction = { id: 'transaction2' };
      (cryptoTransactionWorker as any).transactionProcessMap.set(transaction.id, {});

      (cryptoTransactionWorker as any).checkAndCleanProcess(result, transaction);

      expect((cryptoTransactionWorker as any).transactionProcessMap.has(transaction.id)).toBe(false);
    });

    it('should not remove transaction from transactionProcessMap if result is null', () => {
      const result = null;
      const transaction = { id: 'transaction3' };
      (cryptoTransactionWorker as any).transactionProcessMap.set(transaction.id, {});

      (cryptoTransactionWorker as any).checkAndCleanProcess(result, transaction);

      expect((cryptoTransactionWorker as any).transactionProcessMap.has(transaction.id)).toBe(true);
    });

    it('should not remove transaction from transactionProcessMap if result.errors is present with a key equal to SYSTEM_UPDATE_STATUS_FAILED', () => {
      const result = { errors: [{ key: CryptoTransactionError.SYSTEM_UPDATE_STATUS_FAILED.key }] };
      const transaction = { id: 'transaction4' };
      (cryptoTransactionWorker as any).transactionProcessMap.set(transaction.id, {});

      (cryptoTransactionWorker as any).checkAndCleanProcess(result, transaction);

      expect((cryptoTransactionWorker as any).transactionProcessMap.has(transaction.id)).toBe(true);
    });
  });

  describe('getWorkerOpts', () => {
    it('should return an object with properties from this.bullConfig and lockDuration and concurrency set to specific values', () => {
      const bullConfig = { someProperty: 'someValue' };
      (cryptoTransactionWorker as any).bullConfig = bullConfig;

      const result = (cryptoTransactionWorker as any).getWorkerOpts();

      expect(result).toEqual({
        ...bullConfig,
        lockDuration: 90000,
        concurrency: 200,
      });
    });
  });

  describe('validateNativeTransaction', () => {
    it('should set status to FAILED if transactionReceipt value does not match order amount', () => {
      const transactionReceipt = { value: '2000000000000000000' }; // 2 in wei
      const transaction = {
        order: {
          isCompareIncorrectAmount: jest.fn().mockReturnValue(true),
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateNativeTransaction(
        transactionReceipt,
        transaction,
        cryptoTransactionStatus
      );

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.FAILED);
    });

    it('should not change status if transactionReceipt value matches order amount', () => {
      const transactionReceipt = { value: '1000000000000000000' }; // 1 in wei
      const transaction = {
        order: {
          isCompareIncorrectAmount: jest.fn().mockReturnValue(false),
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateNativeTransaction(
        transactionReceipt,
        transaction,
        cryptoTransactionStatus
      );

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.SUCCEED);
    });
  });

  describe('validateTransactionLog', () => {
    it('should return true if log args match order details and amount is equal to order amount', async () => {
      const log = {
        args: {
          to: 'receiverWallet',
          from: 'senderWallet',
          value: '1000000000000000000', // 1 in wei
        },
      };
      const order = {
        asset: {},
        amount: '1',
        type: TradeType.SELL,
        merchant: { walletAddress: 'receiverWallet' },
        user: { walletAddress: 'senderWallet' },
      };
      const rpc = 'rpc';

      jest.spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'getDecimal').mockResolvedValue(18);
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'convertWeiToUnit')
        .mockReturnValue('1');

      const result = await (cryptoTransactionWorker as any).validateTransactionLog(log, order, rpc);

      expect(result).toBe(true);
    });

    it('should return false if log args do not match order details', async () => {
      const log = {
        args: {
          to: 'otherWallet',
          from: 'senderWallet',
          value: '1000000000000000000', // 1 in wei
        },
      };
      const order = {
        asset: {},
        amount: '1',
        type: TradeType.SELL,
        merchant: { walletAddress: 'receiverWallet' },
        user: { walletAddress: 'senderWallet' },
      };
      const rpc = 'rpc';

      jest.spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'getDecimal').mockResolvedValue(18);
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'convertWeiToUnit')
        .mockReturnValue('1');

      const result = await (cryptoTransactionWorker as any).validateTransactionLog(log, order, rpc);

      expect(result).toBe(false);
    });

    it('should return false if log amount does not match order amount', async () => {
      const log = {
        args: {
          to: 'receiverWallet',
          from: 'senderWallet',
          value: '2000000000000000000', // 2 in wei
        },
      };
      const order = {
        asset: {},
        amount: '1',
        type: TradeType.SELL,
        merchant: { walletAddress: 'receiverWallet' },
        user: { walletAddress: 'senderWallet' },
      };
      const rpc = 'rpc';

      jest.spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'getDecimal').mockResolvedValue(18);
      jest
        .spyOn((cryptoTransactionWorker as any).blockChainTransactionService, 'convertWeiToUnit')
        .mockReturnValue('2');

      const result = await (cryptoTransactionWorker as any).validateTransactionLog(log, order, rpc);

      expect(result).toBe(false);
    });
  });

  describe('validateWalletAddress', () => {
    it('should set status to FAILED if contractAsset exists and transactionReceipt.to is not equal to contractAsset', () => {
      const transactionReceipt = { to: 'someOtherContract' };
      const transaction = {
        order: {
          asset: { contract: 'contractAsset' },
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateWalletAddress(transactionReceipt, transaction, cryptoTransactionStatus);

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.FAILED);
    });

    it('should set status to FAILED if contractAsset does not exist and transactionReceipt.to is not equal to the receiver wallet address', () => {
      const transactionReceipt = { to: 'someOtherAddress' };
      const transaction = {
        order: {
          asset: { contract: null },
          merchant: { walletAddress: 'merchantWallet' },
          user: { walletAddress: 'userWallet' },
          type: TradeType.SELL,
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateWalletAddress(transactionReceipt, transaction, cryptoTransactionStatus);

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.FAILED);
    });

    it('should not change status if contractAsset exists and transactionReceipt.to is equal to contractAsset', () => {
      const transactionReceipt = { to: 'contractAsset' };
      const transaction = {
        order: {
          asset: { contract: 'contractAsset' },
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateWalletAddress(transactionReceipt, transaction, cryptoTransactionStatus);

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.SUCCEED);
    });

    it('should not change status if contractAsset does not exist and transactionReceipt.to is equal to the receiver wallet address', () => {
      const transactionReceipt = { to: 'merchantWallet' };
      const transaction = {
        order: {
          asset: { contract: null },
          merchant: { walletAddress: 'merchantWallet' },
          user: { walletAddress: 'userWallet' },
          type: TradeType.SELL,
        },
      };
      const cryptoTransactionStatus = { status: TransactionStatus.SUCCEED };

      (cryptoTransactionWorker as any).validateWalletAddress(transactionReceipt, transaction, cryptoTransactionStatus);

      expect(cryptoTransactionStatus.status).toBe(TransactionStatus.SUCCEED);
    });
  });

  describe('getWalletAddressReceiverByOrder', () => {
    it('should return merchant wallet address if order type is SELL', async () => {
      const order = {
        type: TradeType.SELL,
        merchant: { walletAddress: 'merchantWallet' },
        user: { walletAddress: 'userWallet' },
      };

      const result = (cryptoTransactionWorker as any).getWalletAddressReceiverByOrder(order);

      expect(result).toBe('merchantWallet');
    });

    it('should return user wallet address if order type is not SELL', async () => {
      const order = {
        type: TradeType.BUY,
        merchant: { walletAddress: 'merchantWallet' },
        user: { walletAddress: 'userWallet' },
      };

      const result = (cryptoTransactionWorker as any).getWalletAddressReceiverByOrder(order);

      expect(result).toBe('userWallet');
    });
  });

  describe('getWalletAddressSenderByOrder', () => {
    it('should return user wallet address if order type is SELL', async () => {
      const order = {
        type: TradeType.SELL,
        merchant: { walletAddress: 'merchantWallet' },
        user: { walletAddress: 'userWallet' },
      };

      const result = (cryptoTransactionWorker as any).getWalletAddressSenderByOrder(order);

      expect(result).toBe('userWallet');
    });

    it('should return merchant wallet address if order type is not SELL', async () => {
      const order = {
        type: TradeType.BUY,
        merchant: { walletAddress: 'merchantWallet' },
        user: { walletAddress: 'userWallet' },
      };

      const result = (cryptoTransactionWorker as any).getWalletAddressSenderByOrder(order);

      expect(result).toBe('merchantWallet');
    });
  });

  describe('transactionMinutesTimeout', () => {
    it('should return true if the current time is after the transaction creation time plus the wait time limit', async () => {
      const transaction = { createdAt: moment().subtract(2, 'minutes').toDate() };
      const masterData = { cryptoSendingWaitTimeLimit: 1 };

      jest
        .spyOn((cryptoTransactionWorker as any).sharedMasterDataService, 'getLatestMasterDataCommon')
        .mockResolvedValue(masterData);

      const result = await (cryptoTransactionWorker as any).transactionMinutesTimeout(transaction);

      expect(result).toBe(true);
    });

    it('should return false if the current time is before the transaction creation time plus the wait time limit', async () => {
      const transaction = { createdAt: moment().subtract(1, 'minutes').toDate() };
      const masterData = { cryptoSendingWaitTimeLimit: 2 };

      jest
        .spyOn((cryptoTransactionWorker as any).sharedMasterDataService, 'getLatestMasterDataCommon')
        .mockResolvedValue(masterData);

      const result = await (cryptoTransactionWorker as any).transactionMinutesTimeout(transaction);

      expect(result).toBe(false);
    });
  });
});
