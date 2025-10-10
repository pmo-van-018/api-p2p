import {UserSellOrderLifecycleService} from '../../../../../src/api/services/Orders/Sell';
import {OrderService} from '../../../../../src/api/services/SystemOrderLifecycleService';
import {Post} from '../../../../../src/api/models/Post';
import {Operation} from '../../../../../src/api/models/Operation';
import {
  Order,
  OrderStatus,
  SELL_ORDER_STEP,
  TRANSACTION_RECEIPT_STATUS_TYPE,
  TransactionStatus
} from '../../../../../src/api/models';
import {prepareServer} from '../../../../utils/server';
import {MockUtils} from '../../../../mocks/MockUtils';
import {closeDatabase} from '../../../../utils/database';
import * as nock from 'nock';
import {Container} from 'typedi';
import {mockUser} from '../../../../mocks/data/UserData';
import {mockPost} from '../../../../mocks/data/PostData';
import {CryptoTransactionError, OrderLifeCycleError} from '../../../../../src/api/errors';
import {BootstrapSettings} from '../../../../utils/bootstrap';
import {mockSellOrderCreatedByUser, mockSellOrderSendingCryptoSuccess} from '../../../../mocks/data/OrderData';
import {OrderCryptoTransactionRequest} from '../../../../../src/api/requests/Orders/OrderCryptoTransactionRequest';
import moment from 'moment';
import {SystemOrderLifecycleService} from '../../../../../src/api/services/SystemOrderLifecycleService';
import {mockCryptoTransaction} from '../../../../mocks/data/CryptoTransactionData';
import {BlockchainTransactionService} from '../../../../../src/api/services/BlockchainTransactionService';
import {UserService} from '../../../../../src/api/services/UserService';
import {PostStatus, TradeType} from '../../../../../src/api/models/P2PEnum';

describe('Test user submit crypto transaction.', () => {
  let settings: BootstrapSettings;
  let userSellOrderLifecycleService: UserSellOrderLifecycleService;
  let orderService: OrderService;
  let userService: UserService;
  let orderCryptoTransactionRequest: OrderCryptoTransactionRequest;
  let systemOrderLifecycleService: SystemOrderLifecycleService;
  let blockchainTransactionService: BlockchainTransactionService;
  let post: Post;
  let user: Operation;
  let order: Order;
  let amount: number;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    userSellOrderLifecycleService = Container.get<UserSellOrderLifecycleService>(UserSellOrderLifecycleService);
    systemOrderLifecycleService = Container.get<SystemOrderLifecycleService>(SystemOrderLifecycleService);
    blockchainTransactionService = Container.get<BlockchainTransactionService>(BlockchainTransactionService);
    orderService = Container.get<OrderService>(OrderService);
    userService = Container.get<UserService>(UserService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = mockUser();
    post = mockPost(PostStatus.ONLINE, TradeType.SELL);
    amount = 1110.22;
    order = mockSellOrderCreatedByUser({ user, post, amount });
    orderCryptoTransactionRequest = new OrderCryptoTransactionRequest();
    orderCryptoTransactionRequest.orderId = order.id;
    orderCryptoTransactionRequest.hash = '0xdb360344aaf6bd367d1a4d7ee79494e535910f44d6ffc9c99e1464a6643d1500';
  });

  test('1.1. Order not found', async () => {
    // Fake order id not exist
    orderCryptoTransactionRequest.orderId = 0;
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
    // Verify order data
    order = await orderService.getById(orderCryptoTransactionRequest.orderId);
    expect(order).toBeNull();
  });

  test('1.2. Order status is invalid', async () => {
    // Fake order id not exist
    order = mockSellOrderSendingCryptoSuccess(user, post);
    orderCryptoTransactionRequest.orderId = order.id;
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
  });

  test('1.4. The crypto payment time is timeout', async () => {
    // Fake order id not exist
    const endedTime = moment.utc().add(-1, 'minutes').toDate();
    order = mockSellOrderCreatedByUser({ user, post, amount, endedTime });
    orderCryptoTransactionRequest.orderId = order.id;
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.CRYPTO_PAYMENT_TIME_IS_EXPIRED.key);
  });

  test('1.5. Crypto user address is incorrect.', async () => {
    // Fake order id not exist
    orderCryptoTransactionRequest.orderId = order.id;
    orderCryptoTransactionRequest.hash = '0xab643883e0cfadf36c62e8b8dca2f00493615f3f7a47c91c2fee1d1d0cb8051f';
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(CryptoTransactionError.CRYPTO_USER_ADDRESS_IS_INCORRECT.key);
  });

  test('1.6. Crypto merchant address is incorrect.', async () => {
    // Fake order id not exist
    user = await userService.getById(1);
    orderCryptoTransactionRequest.orderId = order.id;
    orderCryptoTransactionRequest.hash = '0x00c76a2ac68be6ce6e2fac1c24cf4601688db8275ef554b3490cbaa849195463';
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(CryptoTransactionError.CRYPTO_MERCHANT_ADDRESS_IS_INCORRECT.key);
  });

  test('1.7. Crypto amount is incorrect.', async () => {
    // Fake order id not exist
    user = await userService.getById(1);
    order = mockSellOrderCreatedByUser({ user, post, amount: 111 });
    orderCryptoTransactionRequest.orderId = order.id;
    orderCryptoTransactionRequest.hash = '0x306b559fcc745ea5d6884da19981c6c9931fcd2b1e319b9f8c34dd9bbb478ebd';
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(CryptoTransactionError.CRYPTO_AMOUNT_IS_INCORRECT.key);
  });

  test('1.8. Crypto transaction already exists.', async () => {
    // Fake order id not exist
    const mockTransaction = mockCryptoTransaction({
      status: TransactionStatus.PENDING,
      orderId: order.id,
      hash: orderCryptoTransactionRequest.hash,
    });
    orderCryptoTransactionRequest.orderId = mockTransaction.orderId;
    const result = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(CryptoTransactionError.CRYPTO_TRANSACTION_ALREADY_EXISTS.key);
  });

  test('1.9. Crypto transaction success.', async () => {
    // Fake order id not exist
    user = await userService.getById(1);
    orderCryptoTransactionRequest.orderId = order.id;
    const transaction = await userSellOrderLifecycleService.submitCryptoTransaction(user, orderCryptoTransactionRequest);
    expect(transaction.data).not.toBeNull();
    expect(transaction.errors).toBeNull();
    expect(transaction.data.status).toBe(TransactionStatus.PENDING);

    const blockchainTransaction = await blockchainTransactionService.getTransactionReceipt(transaction.data.hash);
    const status =
      blockchainTransaction.status === TRANSACTION_RECEIPT_STATUS_TYPE.SUCCESS
        ? TransactionStatus.SUCCEED
        : TransactionStatus.FAILED;
    const result = await systemOrderLifecycleService.updateTransactionStatus({
      ...transaction.data,
      status,
    });
    // // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    expect(result.data.status).toBe(TransactionStatus.SUCCEED);
    //
    order = await orderService.getById(result.data.orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe(OrderStatus.PAID);
    expect(order.step).toBe(SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS);
  });
});
