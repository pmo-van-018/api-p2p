import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { NotificationStatus } from '@api/common/models/P2PEnum';
import { Notification } from '@api/notification/models/Notification';

@Entity({ name: 'notification_users' })
export class NotificationUser extends EntityBase {
  @Column({ name: 'user_id', nullable: true, length: 36 })
  public userId: string;

  @Column({ name: 'notification_id', length: 36 })
  public notificationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({ name: 'operation_id', nullable: true })
  public operationId: string;

  @ManyToOne(() => Operation, (operation) => operation.notificationOperators)
  @JoinColumn({ name: 'operation_id' })
  public operation: Operation;

  @ManyToOne(() => Notification)
  @JoinColumn({ name: 'notification_id' })
  public notification: Notification;

  @Column({ name: 'status', type: 'tinyint', default: NotificationStatus.UNREAD })
  public status: NotificationStatus;
}
