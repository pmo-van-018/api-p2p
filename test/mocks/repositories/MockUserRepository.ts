import { UserRepository } from '../../../src/api/repositories/UserRepository';
import { userData } from '../data/UserData';
import { MockRepository } from './MockRepository';

export class MockUserRepository extends MockRepository {
  public static findOne: jest.MockedFunction<typeof UserRepository.prototype.findOne>;
  public static findOneOrFail: jest.MockedFunction<typeof UserRepository.prototype.findOneOrFail>;
  public static save: jest.MockedFunction<typeof UserRepository.prototype.save>;
  public static setupMocks() {
    this.findOne = jest.fn().mockImplementation((param) => Promise.resolve(this.find(userData, param)));
    this.findOneOrFail = jest.fn().mockImplementation((param) => {
      const user = this.find(userData, param);
      if (!user) {
        return Promise.reject('Operation not found');
      }
      return Promise.resolve(user);
    });
    this.save = jest.fn().mockImplementation((user) => this.update(userData, user));
  }
}
