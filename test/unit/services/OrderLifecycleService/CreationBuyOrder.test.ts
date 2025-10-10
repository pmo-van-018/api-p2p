import moment from 'moment';
import * as nock from 'nock';
import { Container } from 'typedi';

import { OrderLifeCycleError, PostError } from '../../../../src/api/errors';
import { BUY_ORDER_STEPS, OrderStatus } from '../../../../src/api/models/Order';
import { PostStatus, TradeType } from '../../../../src/api/models/P2PEnum';
import { Post } from '../../../../src/api/models/Post';
import { Operation } from '../../../../src/api/models/Operation';
import { OrderCreateRequest } from '../../../../src/api/requests/Orders/OrderCreateRequest';
import { UserOrderLifecycleService } from '../../../../src/api/services/UserOrderLifecycleService';
import { OrderService } from '../../../../src/api/services/SystemOrderLifecycleService';
import { UserService } from '../../../../src/api/services/UserService';
import {mockOrderBuyToBePaidStatus} from '../../../mocks/data/OrderData';
import {mockPost} from '../../../mocks/data/PostData';
import { MockUtils } from '../../../mocks/MockUtils';
import { BootstrapSettings } from '../../../utils/bootstrap';
import { closeDatabase } from '../../../utils/database';
import { prepareServer } from '../../../utils/server';

describe('Test Operation create buy order', () => {
  let settings: BootstrapSettings;
  let userOrderLifeCycleService: UserOrderLifecycleService;
  let orderRequest: OrderCreateRequest;
  let userService: UserService;
  let orderService: OrderService;
  let post: Post;
  let user: Operation;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    userOrderLifeCycleService = Container.get<UserOrderLifecycleService>(UserOrderLifecycleService);
    userService = Container.get<UserService>(UserService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = await userService.getById(1);
    post = mockPost();

    orderRequest = new OrderCreateRequest();
    orderRequest.amount = 11;
    orderRequest.postId = post.id;
    orderRequest.price = post.realPrice;
  });

  test('1.1. Operation violates buy order rules with 5 times of order cancellation in 24 hours', async () => {
    // Mock user violate rule
    user = await userService.getById(3);
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.USER_VIOLATES_BUY_ORDER_RULES.key);
    // Verify user data
    user = await userService.getById(user.id);
    expect(user.lockEndTime).not.toBeNull();
    expect(user.lockEndTime?.getTime()).toBeGreaterThan(moment.utc().toDate().getTime());
    const userLockedSecond = moment(user.lockEndTime).diff(moment.utc(), 'seconds');
    expect(userLockedSecond).toBeLessThanOrEqual(24 * 60 * 60);
    expect(userLockedSecond).toBeGreaterThan(0);
  });

  test('1.2. Operation has a pending buy order', async () => {
    // Mock order status TO_BE_PAID
    user = await userService.getById(5);
    const orderToBePaid = mockOrderBuyToBePaidStatus(user, post);
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.USER_HAS_A_PENDING_BUY_ORDER.key);
    // Verify order data
    const order = await orderService.getById(orderToBePaid.id);
    expect(order).toBeDefined();
    expect(order.userId).toBe(user.id);
    expect(order.status).not.toEqual(OrderStatus.COMPLETED);
    expect(order.status).not.toEqual(OrderStatus.CANCELLED);
    expect(order.status).toBe(OrderStatus.TO_BE_PAID);
  });

  test('1.3. The merchant buy post is unavailable', async () => {
    user = await userService.getById(1);
    post = mockPost(PostStatus.OFFLINE, TradeType.BUY);
    orderRequest.postId = post.id;
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(PostError.MERCHANT_BUY_POST_IS_UNAVAILABLE.key);
  });

  test('1.4. Amount is greater than posting available amount', async () => {
    // Mock order amount
    orderRequest.amount = post.availableAmount + 1;
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_AVAILABLE_AMOUNT.key);
    // Verify post data
    expect(post.availableAmount).toBeLessThan(orderRequest.amount);
  });

  test('1.5. The price is invalid', async () => {
    // fake order price
    orderRequest.price = 1.123456;
    const result = await await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.PRICE_IS_INVALID.key);
    // Verify post data
    expect(post.realPrice * Math.pow(10, 9)).not.toEqual(orderRequest.price * Math.pow(10, 9));
  });

  test('1.6. Order amount is less than posting minimum amount', async () => {
    // Fake order amount
    orderRequest.amount = post.minOrderAmount / 2;
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_LESS_THAN_POST_MIN_AMOUNT.key);
    // Verify post data
    expect(post.realPrice * Math.pow(10, 9)).toEqual(orderRequest.price * Math.pow(10, 9));
    expect(post.availableAmount * Math.pow(10, 9)).toBeGreaterThanOrEqual(orderRequest.amount * Math.pow(10, 9));
  });

  test('1.7. Order amount is greater than posting maximum amount', async () => {
    // Fake order amount
    orderRequest.amount = post.maxOrderAmount;
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_POST_MAX_AMOUNT.key);
  });

  test('1.9. Order creation is succeed', async () => {
    const result = await userOrderLifeCycleService.createBuyOrder(user, orderRequest);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    expect(result.data.amount).toBe(orderRequest.amount);
    expect(result.data.price).toBe(orderRequest.price);
    expect(result.data.postId).toBe(orderRequest.postId);
    expect(result.data.userId).toBe(user.id);
    expect(result.data.step).toBe(BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER);
    expect(result.data.status).toBe(OrderStatus.TO_BE_PAID);
  });
});
