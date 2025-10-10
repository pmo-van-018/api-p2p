import * as nock from 'nock';
import Container from 'typedi';

import { OrderLifeCycleError } from '../../../../src/api/errors';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '../../../../src/api/models/Order';
import { Post } from '../../../../src/api/models/Post';
import { Operation } from '../../../../src/api/models/Operation';
import { OrderRequest } from '../../../../src/api/requests/Orders/OrderRequest';
import { MerchantOrderLifecycleService } from '../../../../src/api/services/MerchantOrderLifecycleService';
import { OrderService } from '../../../../src/api/services/SystemOrderLifecycleService';
import { mockOrderBuyConfirmPaidStatus, mockOrderBuyPaidStatus } from '../../../mocks/data/OrderData';
import { mockPostBuyOnline } from '../../../mocks/data/PostData';
import { mockUser } from '../../../mocks/data/UserData';
import { MockUtils } from '../../../mocks/MockUtils';
import { BootstrapSettings } from '../../../utils/bootstrap';
import { closeDatabase } from '../../../utils/database';
import { prepareServer } from '../../../utils/server';

describe('Test Merchant confirm paid', () => {
  let settings: BootstrapSettings;
  let merchantOrderLifeCycleService: MerchantOrderLifecycleService;
  let orderService: OrderService;
  let orderRequest: OrderRequest;
  let post: Post;
  let user: Operation;
  let order: Order;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    merchantOrderLifeCycleService = Container.get<MerchantOrderLifecycleService>(MerchantOrderLifecycleService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = mockUser();
    post = mockPostBuyOnline();
    order = mockOrderBuyConfirmPaidStatus(user, post);
    orderRequest = new OrderRequest();
    orderRequest.orderId = order.id;
  });

  test('1.1. Order not found', async () => {
    // Fake order id not exist
    orderRequest.orderId = 0;
    const result = await merchantOrderLifeCycleService.confirmPaid(orderRequest);
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
    order = mockOrderBuyPaidStatus(user, post);
    orderRequest.orderId = order.id;
    const result = await merchantOrderLifeCycleService.confirmPaid(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.ORDER_STATUS_IS_INVALID.key);
    // Verify order data
    order = await orderService.getById(orderRequest.orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe(OrderStatus.PAID);
  });

  test('1.3. Receiving fiat confirmation is failed', async () => {
    orderRequest.orderId = mockOrderBuyConfirmPaidStatus(user, post).id;
    const result = await merchantOrderLifeCycleService.confirmPaid(orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.RECEIVING_FIAT_CONFIRMATION_IS_FAILED.key);
  });

  test('1.4. Merchant confirm paid is succeed', async () => {
    const result = await merchantOrderLifeCycleService.confirmPaid(orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    // Verify data
    expect(result.data.id).toBe(orderRequest.orderId);
    expect(result.data.status).toBe(OrderStatus.PAID);
    expect(result.data.step).toBe(BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT);
  });
});
