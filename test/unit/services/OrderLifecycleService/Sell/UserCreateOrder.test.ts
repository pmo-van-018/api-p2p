import moment from 'moment';
import * as nock from 'nock';
import {Container} from 'typedi';
import {BootstrapSettings} from '../../../../utils/bootstrap';
import {prepareServer} from '../../../../utils/server';
import {UserService} from '../../../../../src/api/services/UserService';
import {OrderService} from '../../../../../src/api/services/SystemOrderLifecycleService';
import {MockUtils} from '../../../../mocks/MockUtils';
import {closeDatabase} from '../../../../utils/database';
import {mockPost} from '../../../../mocks/data/PostData';
import {OrderSellCreateRequest} from '../../../../../src/api/requests/Orders/OrderSellCreateRequest';
import {Operation} from '../../../../../src/api/models/Operation';
import {Post} from '../../../../../src/api/models/Post';
import {OrderLifeCycleError, PostError} from '../../../../../src/api/errors';
import {UserSellOrderLifecycleService} from '../../../../../src/api/services/Orders/Sell';
import {OrderStatus, SELL_ORDER_STEP} from '../../../../../src/api/models';
import {PostStatus, TradeType} from '../../../../../src/api/models/P2PEnum';
import {mockOrderBuyToBePaidStatus, mockSellOrderCreatedByUser} from '../../../../mocks/data/OrderData';

describe('Test Operation create sell order', () => {
  let settings: BootstrapSettings;
  let userSellOrderLifecycleService: UserSellOrderLifecycleService;
  let orderRequest: OrderSellCreateRequest;
  let userService: UserService;
  let orderService: OrderService;
  let post: Post;
  let user: Operation;

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();

    userSellOrderLifecycleService = Container.get<UserSellOrderLifecycleService>(UserSellOrderLifecycleService);
    userService = Container.get<UserService>(UserService);
    orderService = Container.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(async () => {
    user = await userService.getById(1);
    post = mockPost(PostStatus.ONLINE, TradeType.SELL);

    orderRequest = new OrderSellCreateRequest();
    orderRequest.amount = 11;
    orderRequest.postId = post.id;
    orderRequest.price = post.realPrice;
  });

  test('1.3. Merchant sell post is unavailable', async () => {
    // Mock post id offline
    post = mockPost(PostStatus.OFFLINE, TradeType.SELL);
    orderRequest.postId = post.id;
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(PostError.MERCHANT_SELL_POST_IS_UNAVAILABLE.key);
  });

  test('1.6. Operation has a pending sell order', async () => {
    user = await userService.getById(5);
    let order = await mockOrderBuyToBePaidStatus(user, post);
    const orderToBePaid = mockSellOrderCreatedByUser({ user, post, amount: 1110 });
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify result return
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.USER_HAS_A_PENDING_SELL_ORDER.key);
    // Verify order data
    order = await orderService.getById(orderToBePaid.id);
    expect(order).toBeDefined();
    expect(order.userId).toBe(user.id);
    expect(order.status).not.toEqual(OrderStatus.COMPLETED);
    expect(order.status).not.toEqual(OrderStatus.CANCELLED);
    expect(order.status).toBe(OrderStatus.TO_BE_PAID);
  });

  test('1.7. Operation violates sell order rules with 5 times of order cancellation in 24 hours', async () => {
    // Mock user violate rule
    user = await userService.getById(3);
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.USER_VIOLATES_SELL_ORDER_RULES.key);
    // Verify user data
    user = await userService.getById(user.id);
    expect(user.lockEndTime).not.toBeNull();
    expect(user.lockEndTime?.getTime()).toBeGreaterThan(moment.utc().toDate().getTime());
    const userLockedSecond = moment(user.lockEndTime).diff(moment.utc(), 'seconds');
    expect(userLockedSecond).toBeLessThanOrEqual(24 * 60 * 60);
    expect(userLockedSecond).toBeGreaterThan(0);
  });

  test('1.8. Order price is different with posting price.', async () => {
    // fake order price
    orderRequest.price = 1.123456;
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.PRICE_IS_INVALID.key);
    // Verify post data
    expect(post.realPrice * Math.pow(10, 9)).not.toEqual(orderRequest.price * Math.pow(10, 9));
  });

  test('1.9. Order amount is greater than posting available amount', async () => {
    // Mock order amount
    orderRequest.amount = post.availableAmount + 1;
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_AVAILABLE_AMOUNT.key);
    expect(post.availableAmount).toBeLessThan(orderRequest.amount);
  });

  test('1.10. Order amount is less than posting minimum amount', async () => {
    // Fake order amount
    orderRequest.amount = post.minOrderAmount / 2;
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);

    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_LESS_THAN_POST_MIN_AMOUNT.key);
    // Verify post data
    expect(post.realPrice * Math.pow(10, 9)).toEqual(orderRequest.price * Math.pow(10, 9));
    expect(post.availableAmount * Math.pow(10, 9)).toBeGreaterThanOrEqual(orderRequest.amount * Math.pow(10, 9));
  });

  test('1.11. Order amount is greater than posting maximum amount', async () => {
    // Fake order amount
    orderRequest.amount = post.maxOrderAmount;
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify return data
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
    expect(result.errors[0].key).toBe(OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_POST_MAX_AMOUNT.key);
    // Verify post data
    expect(post.realPrice * Math.pow(10, 9)).toEqual(orderRequest.price * Math.pow(10, 9));
    expect(post.availableAmount * Math.pow(10, 9)).toBeGreaterThanOrEqual(orderRequest.amount * Math.pow(10, 9));
  });

  test('1.13. Order creation is succeed', async () => {
    const result = await userSellOrderLifecycleService.createOrder(orderRequest, user);
    // Verify result return
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
    expect(result.data.amount).toBe(orderRequest.amount);
    expect(result.data.price).toBe(orderRequest.price);
    expect(result.data.postId).toBe(orderRequest.postId);
    expect(result.data.userId).toBe(user.id);
    expect(result.data.step).toBe(SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER);
    expect(result.data.status).toBe(OrderStatus.TO_BE_PAID);
  });
});
