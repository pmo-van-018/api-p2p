import { CryptoTransaction } from '../../../src/api/models/CryptoTransaction';
import { CryptoTransactionRepository } from '../../../src/api/repositories/CryptoTransactionRepository';
import { cryptoTransactionData } from '../data/CryptoTransactionData';
import {MockRepository} from './MockRepository';

export class MockCryptoTransactionRepository extends MockRepository{
  public static findOne: jest.MockedFunction<typeof CryptoTransactionRepository.prototype.findOne>;
  public static save: jest.MockedFunction<typeof CryptoTransactionRepository.prototype.save>;
  public static findOneOrFail: jest.MockedFunction<typeof CryptoTransactionRepository.prototype.findOneOrFail>;
  public static setupMocks() {
    this.findOne = jest.fn().mockResolvedValue(undefined);
    this.save = jest.fn().mockImplementation((data: CryptoTransaction) => {
      data.id = (cryptoTransactionData.length + 1);
      cryptoTransactionData.push(data);
      if (data.hash === 'reject hash') {
        return Promise.reject(data.hash);
      }
      return Promise.resolve(data);
    });
    this.findOneOrFail = jest.fn().mockImplementation((param) => {
      const order = this.find(cryptoTransactionData, param);
      if (!order) {
        return Promise.reject('Crypto Transaction not found');
      }
      return Promise.resolve(order);
    });
  }
}
