import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { NotificationUser } from '@api/notification/models/NotificationUser';

@EntityRepository(NotificationUser)
export class NotificationUserRepository extends BaseRepository<NotificationUser> {}
