import {
  MerchantSellOrderLifecycleService,
} from '../../../../../src/api/services/Orders/Sell';
import {OrderService} from '../../../../../src/api/services/SystemOrderLifecycleService';
import {Post} from '../../../../../src/api/models/Post';
import {Operation} from '../../../../../src/api/models/Operation';
import {Order, OrderStatus, SELL_ORDER_STEP} from '../../../../../src/api/models';
import {prepareServer} from '../../../../utils/server';
import {MockUtils} from '../../../../mocks/MockUtils';
import {closeDatabase} from '../../../../utils/database';
import * as nock from 'nock';
import { Container } from 'typedi';
import {mockUser} from '../../../../mocks/data/UserData';
import {mockPostBuyOnline} from '../../../../mocks/data/PostData';
import {OrderRequest} from '../../../../../src/api/requests/Orders/OrderRequest';
import {OrderLifeCycleError} from '../../../../../src/api/errors';
import {BootstrapSettings} from '../../../../utils/bootstrap';
import {mockSellOrderCreatedByUser, mockSellOrderSendingCryptoSuccess} from '../../../../mocks/data/OrderData';

describe('Test Merchant confirm payment sent.', () => {
  let settings: BootstrapSettings;
  let merchantSellOrderLifecycleService: MerchantSellOrderLifecycleService;
  let orderService: OrderService;
  let orderRequest: OrderRequest;
  let post: Post;
  let user: Operation;
  let order: Order;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    merchantSellOrderLifecycleService = Container.get<MerchantSellOrderLifecycleService>(MerchantSellOrderLifecycleService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = mockUser();
    post = mockPostBuyOnline();
    order = mockSellOrderSendingCryptoSuccess(user, post);
    orderRequest = new OrderRequest();
    orderRequest.orderId = order.id;
  });

  test('1.1. Order not found', async () => {
    // Fake order id not exist
    orderRequest.orderId = 0;
    const result = await merchantSellOrderLifecycleService.confirmSent(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeNull();
  });

  test('1.2. Order status is invalid', async () => {
    // Fake order id not exist
    order = mockSellOrderCreatedByUser({ user, post });
    orderRequest.orderId = order.id;
    const result = await merchantSellOrderLifecycleService.confirmSent(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
  });

  test('1.3. Sending fiat confirmation is failed.', async () => {
    // Fake order id not exist
    order = mockSellOrderSendingCryptoSuccess(user, post);
    orderRequest.orderId = order.id;
    const result = await merchantSellOrderLifecycleService.confirmSent(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.FIAT_CONFIRMATION_IS_FAILED.key);
  });

  test('1.4 The user received is succeed', async () => {
    const result = await merchantSellOrderLifecycleService.confirmSent(orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.id).toBe(orderRequest.orderId);
    expect(result.data.status).toBe(OrderStatus.CONFIRM_PAID);
    expect(result.data.step).toBe(SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT);
  });
});
