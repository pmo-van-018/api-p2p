import { AfterLoad, Column, Entity, OneToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';

@Entity({ name: 'statistics' })
export class Statistic extends EntityBase {
  @Column({ name: 'user_id', unique: true, type: 'varchar', nullable: true, length: 36 })
  public userId: string;

  @OneToOne(() => User, (user) => user.statistic)
  public user: User;

  @Column({ name: 'operation_id', nullable: true, length: 36 })
  public operationId: string;

  @OneToOne(() => Operation, (operation) => operation.statistic)
  public operation: Operation;

  @Column({ name: 'total_order_count', default: 0 })
  public totalOrderCount: number;

  @Column({ name: 'total_buy_order_count', default: 0 })
  public totalBuyOrderCount: number;

  @Column({ name: 'total_sell_order_count', default: 0 })
  public totalSellOrderCount: number;

  @Column({ name: 'total_amount_count', default: 0, type: 'decimal', precision: 27, scale: 8 })
  public totalAmountCount: number;

  @Column({ name: 'total_fee_count', default: 0, type: 'decimal', precision: 27, scale: 8 })
  public totalFeeCount: number;

  @Column({ name: 'total_penalty_fee_count', default: 0, type: 'decimal', precision: 27, scale: 8 })
  public totalPenaltyFeeCount: number;

  @Column({ name: 'order_completed_count', default: 0 })
  public orderCompletedCount: number;

  @Column({ name: 'order_waiting_count', default: 0 })
  public orderWaitingCount: number;

  @Column({ name: 'order_waiting_user_count', default: 0 })
  public orderWaitingUserCount: number;

  @Column({ name: 'order_appeal_count', default: 0 })
  public orderAppealCount: number;

  @Column({ name: 'month_order_count', default: 0 })
  public monthOrderCount: number;

  @Column({ name: 'month_order_completed_count', default: 0 })
  public monthOrderCompletedCount: number;

  @Column({ name: 'post_shown_count', default: 0 })
  public postShownCount: number;

  @Column({ name: 'post_hide_count', default: 0 })
  public postHideCount: number;

  @Column({ name: 'cancel_order_count', default: 0 })
  public cancelOrderCount: number;

  @Column({ name: 'last_count_at', nullable: true })
  public lastCountAt: Date | null;

  @Column({ name: 'average_completed_time', default: '0', type: 'varchar' })
  public averageCompletedTime: number;
 
  @Column({ name: 'average_cancelled_time', default: '0', type: 'varchar' })
  public averageCancelledTime: number;

  @AfterLoad()
  public convertType() {
    this.averageCompletedTime = Number(this.averageCompletedTime);
    this.averageCancelledTime = Number(this.averageCancelledTime);
  }
}
