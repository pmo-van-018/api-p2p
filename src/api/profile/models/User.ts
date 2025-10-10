import { BeforeInsert, Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { NotificationUser } from '@api/notification/models/NotificationUser';
import { Order } from '@api/order/models/Order';
import { Statistic } from '@api/statistic/models/Statistic';
import { NotificationType, UserStatus, UserType } from '@api/common/models/P2PEnum';
import { SupportRequest } from '@api/support-request/models/SupportRequest';
import { generateReferralCode } from '@base/utils/helper.utils';

@Entity({ name: 'users' })
export class User extends EntityBase {
  @Column({ name: 'wallet_address', unique: true, nullable: true })
  public walletAddress: string;

  @Column({
    name: 'type',
    type: 'tinyint',
    default: UserType.USER,
  })
  public type: UserType;

  @Index({ fulltext: true })
  @Column({ name: 'nick_name', nullable: true })
  public nickName?: string;

  @OneToMany(() => Order, (order) => order.user)
  public orders?: Order[];

  @OneToMany(() => SupportRequest, (supportRequest) => supportRequest.user)
  public supportRequests?: SupportRequest[];

  @Column({ name: 'statistic_id', nullable: true, length: 36 })
  public statisticId?: string;

  @OneToOne(() => Statistic, (statistic) => statistic.user)
  @JoinColumn({ name: 'statistic_id' })
  public statistic: Statistic;

  @Column({ name: 'lock_end_time', nullable: true })
  public lockEndTime?: Date | null;

  @Column({ name: 'skip_note_at', nullable: true })
  public skipNoteAt?: Date | null;

  @Column({ name: 'activated_at', nullable: true })
  public activatedAt?: Date | null;

  @Column({ name: 'last_login_at', nullable: true })
  public lastLoginAt?: Date | null;

  @Column({ name: 'status', type: 'tinyint', default: UserStatus.ACTIVE })
  public status: UserStatus;

  @Column({ name: 'peer_chat_id', nullable: true, length: 36 })
  public peerChatId?: string;

  @Column({
    name: 'allow_notification',
    type: 'simple-array',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => value?.map((v) => Number(v)),
    },
  })
  public allowNotification: NotificationType[];

  @Column({ name: 'referral_code', nullable: true, length: 8, unique: true })
  public referralCode?: string;

  @Column({ name: 'is_referred', nullable: true, default: false })
  public isReferred?: boolean;

  @OneToMany(() => NotificationUser, (notificationUser) => notificationUser.user)
  public notificationUsers?: NotificationUser[];

  @Column({ name: 'avatar', nullable: true, length: 64 })
  public avatar?: string;

  @BeforeInsert()
  protected generateReferralCode() {
    this.referralCode = generateReferralCode();
  }
}
