import { Order, OrderStatus } from '../../../src/api/models/Order';
import { Post } from '../../../src/api/models/Post';
import { OrderRepository } from '../../../src/api/repositories/OrderRepository';
import { assetData } from '../data/AssetData';
import { fiatData } from '../data/FiatData';
import { orderData } from '../data/OrderData';
import { mockPaymentMethod } from '../data/PaymentMethodData';
import { userData } from '../data/UserData';
import { MockPostRepository } from './MockPostRepository';
import { MockRepository } from './MockRepository';

export class MockOrderRepository extends MockRepository {
  public static save: jest.MockedFunction<typeof OrderRepository.prototype.save>;
  public static saves: jest.MockedFunction<typeof OrderRepository.prototype.saves>;
  public static update: jest.MockedFunction<typeof OrderRepository.prototype.update>;
  public static findOne: jest.MockedFunction<typeof OrderRepository.prototype.findOne>;
  public static findOneOrFail: jest.MockedFunction<typeof OrderRepository.prototype.findOneOrFail>;
  public static getPendingByUser: jest.MockedFunction<typeof OrderRepository.prototype.getPendingByUser>;
  public static getFullInfoById: jest.MockedFunction<typeof OrderRepository.prototype.getFullInfoById>;
  public static setupMocks() {
    this.update = jest.fn().mockImplementation((id: number, data: any) => {
      const orderMatched = orderData.find((order) => {
        return order.id === id;
      });
      if (orderMatched) {
        const entity = MockRepository.update(orderData, { ...orderMatched, ...data });
        MockOrderRepository.save(entity);
        return Promise.resolve({ affected: 1 });
      }
      return Promise.resolve({ affected: 0 });
    });
    this.saves = jest.fn().mockImplementation((...args) => {
      for (const entity of args) {
        switch (entity.constructor) {
          case Order:
            if (entity.amount === 12 && entity.status === OrderStatus.TO_BE_PAID) {
              return Promise.reject('Create order failed');
            }
            if ((entity.id === 2 || entity.id === 7) && entity.status === OrderStatus.CANCELLED) {
              return Promise.reject(false);
            }
            MockOrderRepository.save(entity);
            break;
          case Post:
            MockPostRepository.save(entity);
            break;
          default:
            break;
        }
      }
      return Promise.resolve(true);
    });
    this.save = jest.fn().mockImplementation((order) => {
      order.merchant = userData.find((u) => u.id === order.merchantId);
      order.fiat = fiatData.find((f) => f.id === order.fiatId);
      order.asset = assetData.find((a) => a.id === order.assetId);
      order.paymentMethod = mockPaymentMethod(order.merchantId);
      order.cryptoTransactions = [];
      if ((order.id === 2 || order.id === 8) && order.status === OrderStatus.CONFIRM_PAID) {
        return Promise.reject('Operation confirm payment save error');
      }
      if ((order.id === 2 || order.id === 7) && order.status === OrderStatus.PAID) {
        return Promise.reject('Merchant confirm paid save error');
      }
      return Promise.resolve(MockRepository.update(orderData, order));
    });
    this.findOne = jest.fn().mockImplementation((param) => {
      return Promise.resolve(this.find(orderData, param.where));
    });
    this.findOneOrFail = jest.fn().mockImplementation((param) => {
      const order = this.find(orderData, param);
      if (!order) {
        return Promise.reject('Order not found');
      }
      return Promise.resolve(order);
    });
    this.getPendingByUser = jest.fn().mockImplementation((userId) => {
      return Promise.resolve(
        orderData.find(
          (o) => o.userId === userId && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
        )
      );
    });
    this.getFullInfoById = jest.fn().mockImplementation((id) => orderData.find((o) => o.id === id));
  }
}
