import {BootstrapSettings} from '../../../../utils/bootstrap';
import {UserSellOrderLifecycleService} from '../../../../../src/api/services/Orders/Sell';
import {OrderService} from '../../../../../src/api/services/SystemOrderLifecycleService';
import {Post} from '../../../../../src/api/models/Post';
import {Operation} from '../../../../../src/api/models/Operation';
import {Order, OrderStatus} from '../../../../../src/api/models';
import {prepareServer} from '../../../../utils/server';
import {MockUtils} from '../../../../mocks/MockUtils';
import {closeDatabase} from '../../../../utils/database';
import * as nock from 'nock';
import { Container } from 'typedi';
import {mockUser} from '../../../../mocks/data/UserData';
import {mockPostBuyOnline} from '../../../../mocks/data/PostData';
import {OrderRequest} from '../../../../../src/api/requests/Orders/OrderRequest';
import {
  mockSellOrderCreatedByUser,
  mockSellOrderSendingCryptoSuccess
} from '../../../../mocks/data/OrderData';
import {OrderLifeCycleError} from '../../../../../src/api/errors';
import moment from 'moment';

describe('Test Operation cancel sell order', () => {
  let settings: BootstrapSettings;
  let userSellOrderLifecycleService: UserSellOrderLifecycleService;
  let orderService: OrderService;
  let orderRequest;
  let post: Post;
  let user: Operation;
  let order: Order;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    userSellOrderLifecycleService = Container.get<UserSellOrderLifecycleService>(UserSellOrderLifecycleService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = mockUser();
    post = mockPostBuyOnline();
    order = mockSellOrderCreatedByUser({ user, post });
    orderRequest = new OrderRequest();
    orderRequest.orderId = order.id;
  });

  test('1.1. Order not found', async () => {
    // Fake order id not exist
    orderRequest.orderId = 0;
    const result = await userSellOrderLifecycleService.cancelOrder(orderRequest);

    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeNull();
  });

  test('1.2. Buy order has been done or successful cancelled from user side.', async () => {
    // Mock order confirm paid status
    order = mockSellOrderSendingCryptoSuccess(user, post);
    orderRequest.orderId = order.id;
    const result = await userSellOrderLifecycleService.cancelOrder(orderRequest);

    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.SELL_ORDER_STATUS_IS_INVALID.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe(OrderStatus.PAID);
  });

  test('1.3. The payment and appeal time has been out. The buy order has been cancelled by system.', async () => {
    // Mock buy order cancel expired
    const endedTime = moment.utc().add(-1, 'minutes').toDate();
    order = mockSellOrderCreatedByUser({ user, post, endedTime });
    orderRequest.orderId = order.id;
    const result = await userSellOrderLifecycleService.cancelOrder(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.SELL_ORDER_TIMEOUT.key);
  });

  test('1.5. The user cancel order is succeed', async () => {
    const result = await userSellOrderLifecycleService.cancelOrder(orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.id).toBe(orderRequest.orderId);
    expect(result.data.status).toBe(OrderStatus.CANCELLED);
  });
});
