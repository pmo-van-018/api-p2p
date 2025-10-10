import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { UserPassword } from '../models/UserPassword';

@EntityRepository(UserPassword)
export class UserPasswordRepository extends RepositoryBase<UserPassword> {}
