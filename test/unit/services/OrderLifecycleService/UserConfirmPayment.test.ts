import moment from 'moment';
import * as nock from 'nock';
import Container from 'typedi';

import { OrderLifeCycleError } from '../../../../src/api/errors';
import { Order, OrderStatus } from '../../../../src/api/models/Order';
import { Post } from '../../../../src/api/models/Post';
import { Operation } from '../../../../src/api/models/Operation';
import { OrderRequest } from '../../../../src/api/requests/Orders/OrderRequest';
import { UserOrderLifecycleService } from '../../../../src/api/services/UserOrderLifecycleService';
import { OrderService } from '../../../../src/api/services/SystemOrderLifecycleService';
import {
  mockOrderBuyConfirmPaidStatus,
  mockOrderBuyToBePaidStatus,
  mockOrderBuyWaitUser,
} from '../../../mocks/data/OrderData';
import { mockPostBuyOnline } from '../../../mocks/data/PostData';
import { mockUser } from '../../../mocks/data/UserData';
import { MockUtils } from '../../../mocks/MockUtils';
import { BootstrapSettings } from '../../../utils/bootstrap';
import { closeDatabase } from '../../../utils/database';
import { prepareServer } from '../../../utils/server';

describe('Test End-user confirm payment', () => {
  let settings: BootstrapSettings;
  let userOrderLifeCycleService: UserOrderLifecycleService;
  let orderService: OrderService;
  let orderRequest;
  let post: Post;
  let user: Operation;
  let order: Order;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    userOrderLifeCycleService = Container.get<UserOrderLifecycleService>(UserOrderLifecycleService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = mockUser();
    post = mockPostBuyOnline();
    order = mockOrderBuyToBePaidStatus(user, post);
    orderRequest = new OrderRequest();
    orderRequest.orderId = order.id;
  });

  test('1.1. The order is not found', async () => {
    // Fake order id not exist
    orderRequest.orderId = 0;
    const result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeNull();
  });

  test('1.2. The fiat payment time is expired', async () => {
    // Mock buy order confirm payment expired
    let endedTime = moment.utc().add(-1, 'minutes').toDate();
    order = mockOrderBuyWaitUser(user, post, endedTime);

    orderRequest.orderId = order.id;
    let result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.FIAT_PAYMENT_TIME_IS_EXPIRED.key);

    // Mock order confirm payment timeout auto cancel
    endedTime = moment.utc().add(10, 'minutes').toDate();
    order = mockOrderBuyWaitUser(user, post, endedTime);
    orderRequest.orderId = order.id;
    result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.FIAT_PAYMENT_TIME_IS_EXPIRED.key);
  });

  test('1.3. Order status is invalid', async () => {
    // Mock order confirm paid status
    order = mockOrderBuyConfirmPaidStatus(user, post);
    orderRequest.orderId = order.id;
    const result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe(OrderStatus.CONFIRM_PAID);
  });

  test('1.4. Sending fiat confirmation is failed', async () => {
    orderRequest.orderId = mockOrderBuyToBePaidStatus(user, post).id;
    const result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.SENDING_FIAT_CONFIRMATION_IS_FAILED.key);
  });

  test('1.5. Sending fiat confirmation is succeed', async () => {
    const result = await userOrderLifeCycleService.confirmPayment(orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.id).toBe(orderRequest.orderId);
    expect(result.data.status).toBe(OrderStatus.CONFIRM_PAID);
  });
});
