import Container from 'typedi';
import { ConnectionManager, QueryRunner } from 'typeorm';

import { Order, OrderStatus } from '../../src/api/models/Order';
import { Post } from '../../src/api/models/Post';
import { CryptoTransactionRepository } from '../../src/api/repositories/CryptoTransactionRepository';
import { OrderRepository } from '../../src/api/repositories/OrderRepository';
import { PostRepository } from '../../src/api/repositories/PostRepository';
import { UserRepository } from '../../src/api/repositories/UserRepository';
import { MockCryptoTransactionRepository } from './repositories/MockCryptoTransactionRepository';
import { MockOrderRepository } from './repositories/MockOrderRepository';
import { MockPostRepository } from './repositories/MockPostRepository';
import { MockUserRepository } from './repositories/MockUserRepository';
import {Operation} from '../../src/api/models/Operation';

export class MockUtils {
  public static mockOrm() {
    Container.set(ConnectionManager, {
      has: (_connectionName: string) => true,
      get: (_connectionName: string) => ({
        createQueryRunner: (): QueryRunner => {
          return {
            manager: {
              save: jest.fn().mockImplementation((entity: any) => {
                switch (entity.constructor) {
                  case Order:
                    if (entity.amount === 12 && entity.status === OrderStatus.TO_BE_PAID) {
                      return Promise.reject('Create order failed');
                    }
                    if ((entity.id === 2 || entity.id === 7) && entity.status === OrderStatus.CANCELLED) {
                      return Promise.reject('Cancel order failed');
                    }
                    MockOrderRepository.save(entity);
                    break;
                  case Post:
                    MockPostRepository.save(entity);
                    break;
                  case Operation:
                    MockUserRepository.save(entity);
                    break;
                  default:
                    break;
                }
              }),
            },
            release: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
          } as unknown as QueryRunner;
        },
        getRepository: (entityType: any) => {
          console.warn(`No mock repository found for ${entityType}`);
        },
        getMongoRepository: (entityType: any) => {
          console.warn(`No mock repository found for ${entityType}`);
        },
        getTreeRepository: (entityType: any) => {
          console.warn(`No mock repository found for ${entityType}`);
        },
        getCustomRepository: (repositoryType: any) => {
          switch (repositoryType) {
            case OrderRepository:
              MockOrderRepository.setupMocks();
              return MockOrderRepository;
            case PostRepository:
              MockPostRepository.setupMocks();
              return MockPostRepository;
            case UserRepository:
              MockUserRepository.setupMocks();
              return MockUserRepository;
            case CryptoTransactionRepository:
              MockCryptoTransactionRepository.setupMocks();
              return MockCryptoTransactionRepository;
            default:
              console.warn(`No mock repository found for ${repositoryType}`);
          }
        },
      }),
    });
  }
}
