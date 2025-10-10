import * as nock from 'nock';
import Container from 'typedi';

import { OrderLifeCycleError } from '../../../../src/api/errors';
import { Post } from '../../../../src/api/models/Post';
import { Operation } from '../../../../src/api/models/Operation';
import { OrderCryptoTransactionRequest } from '../../../../src/api/requests/Orders/OrderCryptoTransactionRequest';
import { MerchantOrderLifecycleService } from '../../../../src/api/services/MerchantOrderLifecycleService';
import { mockOrderBuyPaidStatus, mockOrderBuyToBePaidStatus } from '../../../mocks/data/OrderData';
import { mockPostBuyOnline } from '../../../mocks/data/PostData';
import { MockUtils } from '../../../mocks/MockUtils';
import { BootstrapSettings } from '../../../utils/bootstrap';
import { closeDatabase } from '../../../utils/database';
import { prepareServer } from '../../../utils/server';
import {UserService} from '../../../../src/api/services/UserService';

describe('Test Merchant submit crypto transaction', () => {
  let settings: BootstrapSettings;
  let merchantOrderLifeCycleService: MerchantOrderLifecycleService;
  let userService: UserService;
  let request: OrderCryptoTransactionRequest;
  let post: Post;
  let user: Operation;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();
    merchantOrderLifeCycleService = Container.get<MerchantOrderLifecycleService>(MerchantOrderLifecycleService);
    userService = Container.get<UserService>(UserService);
  });

  beforeEach(async () => {
    user = await userService.getById(1);
    post = mockPostBuyOnline();
    const order = mockOrderBuyPaidStatus(user, post);
    request = new OrderCryptoTransactionRequest();
    request.orderId = order.id;
    request.hash = '0xdb360344aaf6bd367d1a4d7ee79494e535910f44d6ffc9c99e1464a6643d1500';
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  test('1.1. The order is not found', async () => {
    // Fake order id
    request.orderId = 0;
    const result = await merchantOrderLifeCycleService.submitCryptoTransaction(user, request);
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
  });

  test('1.2. Order status is invalid', async () => {
    // Mock order status to be paid
    const orderToBePaid = mockOrderBuyToBePaidStatus(user, post);
    request.orderId = orderToBePaid.id;
    const result = await merchantOrderLifeCycleService.submitCryptoTransaction(user, request);
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
  });

  test('1.3. Submit crypto transaction is failed', async () => {
    // Fake data error;
    request.hash = '0xdb360344aaf6bd367d1a4d7ee79494e535910f44d6ffc9c99e1464a6643d1500';
    const result = await merchantOrderLifeCycleService.submitCryptoTransaction(user, request);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.SUBMIT_CRYPTO_TRANSACTION_FAIL.key);
  });

  test('1.4. Submit crypto transaction succeed', async () => {
    const result = await merchantOrderLifeCycleService.submitCryptoTransaction(user, request);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.orderId).toBe(request.orderId);
    expect(result.data.hash).toBe(request.hash);
  });
});
