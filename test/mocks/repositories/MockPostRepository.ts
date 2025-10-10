import { PostRepository } from '../../../src/api/repositories/PostRepository';
import { postData } from '../data/PostData';
import { MockRepository } from './MockRepository';

export class MockPostRepository extends MockRepository {
  public static findOne: jest.MockedFunction<typeof PostRepository.prototype.findOne>;
  public static findOneOrFail: jest.MockedFunction<typeof PostRepository.prototype.findOneOrFail>;
  public static save: jest.MockedFunction<typeof PostRepository.prototype.save>;
  public static setupMocks() {
    this.findOne = jest.fn().mockImplementation((param) => Promise.resolve(this.find(postData, param)));
    this.findOneOrFail = jest.fn().mockImplementation((param) => {
      const post = this.find(postData, param);
      if (!post) {
        return Promise.reject('Post not found');
      }
      return Promise.resolve(post);
    });
    this.save = jest.fn().mockImplementation((post) => this.update(postData, post));
  }
}
