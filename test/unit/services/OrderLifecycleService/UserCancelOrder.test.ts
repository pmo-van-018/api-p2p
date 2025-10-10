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

describe('Test Operation cancel buy order', () => {
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

  test('1.1. Order not found', async () => {
    // Fake order id not exist
    orderRequest.orderId = 0;
    const result = await userOrderLifeCycleService.cancelBuyOrder(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_NOT_FOUND.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeNull();
  });

  test('1.2. Order status is invalid', async () => {
    // Mock order confirm paid status
    order = mockOrderBuyConfirmPaidStatus(user, post);
    orderRequest.orderId = order.id;
    const result = await userOrderLifeCycleService.cancelBuyOrder(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe(OrderStatus.CONFIRM_PAID);
  });

  test('1.3. The user cancel order is expired', async () => {
    // Mock buy order cancel expired
    const endedTime = moment.utc().add(-1, 'minutes').toDate();
    order = mockOrderBuyWaitUser(user, post, endedTime);

    orderRequest.orderId = order.id;
    const result = await userOrderLifeCycleService.cancelBuyOrder(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.CANCEL_TIMEOUT.key);
  });

  test('1.4. Buy order cancellation is failed.', async () => {
    orderRequest.orderId = mockOrderBuyToBePaidStatus(user, post).id;
    const result = await userOrderLifeCycleService.cancelBuyOrder(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_CANCELATION_FAILED.key);
  });

  test('1.5. The user cancel order is succeed', async () => {
    const result = await userOrderLifeCycleService.cancelBuyOrder(orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.id).toBe(orderRequest.orderId);
    expect(result.data.status).toBe(OrderStatus.CANCELLED);
  });
});
