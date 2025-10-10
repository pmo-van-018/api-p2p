import { Column, Entity, OneToMany } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { NotificationType } from '@api/common/models/P2PEnum';
import { NotificationUser } from '@api/notification/models/NotificationUser';

@Entity({ name: 'notifications' })
export class Notification extends EntityBase {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  public title: string;

  @Column({ name: 'description', type: 'varchar', length: 1023 })
  public description: string;

  @Column({ name: 'type', type: 'tinyint' })
  public type: NotificationType;

  @Column({ name: 'link', type: 'varchar', length: 255 })
  public link?: string;

  @OneToMany(() => NotificationUser, (notificationUser) => notificationUser.notification)
  public notificationUsers?: NotificationUser[];
}
