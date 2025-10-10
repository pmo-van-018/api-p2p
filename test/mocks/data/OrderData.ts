import moment from 'moment';

import {BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP} from '../../../src/api/models/Order';
import {OrderConfig} from '../../../src/api/models/OrderConfig';
import {TradeType} from '../../../src/api/models/P2PEnum';
import {Post} from '../../../src/api/models/Post';
import {Operation} from '../../../src/api/models/Operation';
import {mockPaymentMethod} from './PaymentMethodData';
import {mockMerchant, mockUser} from './UserData';

export const orderData: Order[] = [];
export type OrderMockDataType = {
  user: Operation,
  post: Post,
  amount?: number,
  status?: OrderStatus,
  step?: BUY_ORDER_STEPS | SELL_ORDER_STEP,
  type?: TradeType,
  endedTime?: Date,
};

export const mockOrder = (user: Operation, post: Post, status: OrderStatus, step: BUY_ORDER_STEPS | SELL_ORDER_STEP, type: TradeType = TradeType.BUY) => {
  const order = new Order();
  order.id = orderData.length + 1;
  order.userId = user.id;
  order.postId = post.id;
  order.merchantId = post.merchantId;
  order.assetId = post.assetId;
  order.fiatId = post.fiatId;
  order.amount = 11;
  order.requestAmount = 11;
  order.price = post.realPrice;
  order.status = status;
  order.step = step;
  order.type = type;
  order.merchant = mockMerchant();
  order.user = mockUser();
  order.createdTime = moment.utc().toDate();
  order.endedTime = moment(moment.utc()).add(15, 'minutes').toDate();
  order.config = JSON.stringify(new OrderConfig(15));
  order.paymentMethodId = mockPaymentMethod(post.merchantId).id;
  orderData.push(order);
  return order;
};

export const mockOrderBuyToBePaidStatus = (user: Operation, post: Post) => {
  return mockOrder(user, post, OrderStatus.TO_BE_PAID, BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER, TradeType.BUY);
};

export const mockOrderBuyPaidStatus = (user: Operation, post: Post) => {
  return mockOrder(user, post, OrderStatus.PAID, BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT, TradeType.BUY);
};

export const mockOrderBuyConfirmPaidStatus = (user: Operation, post: Post) => {
  return mockOrder(user, post, OrderStatus.CONFIRM_PAID, BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER, TradeType.BUY);
};

export const mockOrderBuyWaitTimeout = (user: Operation, post: Post, endedTime: Date, status: OrderStatus, type = TradeType.BUY) => {
  const order = new Order();
  order.id = orderData.length + 1;
  order.userId = user.id;
  order.postId = post.id;
  order.merchantId = post.merchantId;
  order.assetId = post.assetId;
  order.fiatId = post.fiatId;
  order.amount = 11;
  order.requestAmount = 11;
  order.price = post.realPrice;
  order.status = status;
  order.type = TradeType.BUY;
  order.createdTime = moment.utc().toDate();
  order.endedTime = endedTime;
  order.config = JSON.stringify(new OrderConfig(15));
  order.paymentMethodId = mockPaymentMethod(post.merchantId).id;
  orderData.push(order);
  return order;
};

export const mockOrderBuyWaitUser = (user: Operation, post: Post, endedTime: Date) => {
  return mockOrderBuyWaitTimeout(user, post, endedTime, OrderStatus.TO_BE_PAID);
};

export const mockOrderBuyWaitMerchant = (user: Operation, post: Post, endedTime: Date, status: OrderStatus) => {
  return mockOrderBuyWaitTimeout(user, post, endedTime, status);
};

// Mock sell order
export const mockOrderData = ({
  user,
  post,
  amount,
  status,
  step,
  type = TradeType.BUY,
  endedTime,
  }: OrderMockDataType) => {
  const order = new Order();
  order.id = orderData.length + 1;
  order.userId = user.id;
  order.postId = post.id;
  order.merchantId = post.merchantId;
  order.assetId = post.assetId;
  order.fiatId = post.fiatId;
  order.amount = amount;
  order.requestAmount = amount;
  order.price = post.realPrice;
  order.status = status;
  order.step = step;
  order.type = type;
  order.createdTime = moment.utc().toDate();
  order.endedTime = endedTime;
  order.config = JSON.stringify(new OrderConfig(15));
  order.paymentMethodId = mockPaymentMethod(post.merchantId).id;
  order.merchant = mockMerchant();
  order.user = mockUser();
  orderData.push(order);
  return order;
};

export const mockSellOrderSendingCryptoSuccess = (
  user: Operation,
  post: Post,
  endTime?: Date) => {
  endTime = moment(moment.utc()).add(10, 'minutes').toDate();
  return mockOrderData({
    user,
    post,
    amount: 12000,
    status: OrderStatus.PAID,
    step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
    type: TradeType.SELL,
    endedTime: endTime,
  });
};

// step 1
export const mockSellOrderCreatedByUser = ({ user, post, endedTime, amount }: OrderMockDataType) => {
  return mockOrderData({
    user,
    post,
    amount,
    type: TradeType.SELL,
    status: OrderStatus.TO_BE_PAID,
    step: SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
    endedTime: endedTime ? endedTime : moment(moment.utc()).add(15, 'minutes').toDate(),
  });
};

// step 7
export const mockSellOrderSentFiatByMerchant = (user: Operation, post: Post, endedTime?: Date) => {
  return mockOrderData({
    user,
    post,
    amount: 1000,
    type: TradeType.SELL,
    status: OrderStatus.CONFIRM_PAID,
    step: SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    endedTime: endedTime ? endedTime : moment(moment.utc()).add(5, 'minutes').toDate(),
  });
};
