import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { User } from '@api/profile/models/User';
import { Type } from 'class-transformer';
import { ReferralStatus } from '@api/referral/enums/Referral';
import { Order } from '@api/order/models/Order';

@Entity({ name: 'referrals' })
@Index(["inviteeId", "inviterId"], { unique: true })
export class Referral extends EntityBase {
  @Column({ name: 'inviter_id', length: 36 })
  public inviterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  @Type(() => User)
  public inviter: User;

  @Column({ name: 'invitee_id', length: 36 })
  public inviteeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitee_id' })
  @Type(() => User)
  public invitee: User;
    
  @Column({ name: 'status', type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING  })
  public status: ReferralStatus;
    
  @Column({ name: 'order_id', length: 36, nullable: true })
  public orderId: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  @Type(() => Order)
  public order: Order;
}
