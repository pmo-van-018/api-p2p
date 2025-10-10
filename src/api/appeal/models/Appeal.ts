import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { Order } from '@api/order/models/Order';
import { Type } from 'class-transformer';

export enum AppealStatus {
  PREPARE = 0,
  OPEN = 1,
  PENDING = 2,
  CLOSE = 3,
}

export enum SELL_APPEAL_RESULTS {
  SELL_MCWIN_SUCCESS = 1,
  SELL_EUWIN_CANCEL_MC_VIOLATE = 2,
  SELL_NOWIN_CANCEL_MC_HAS_RETURNED = 3,
}

export enum BUY_APPEAL_RESULTS {
  BUY_MCWIN_CANCEL = 1,
  BUY_EUWIN_REOPEN = 2,
  BUY_EUWIN_FORCE_CLOSE = 3,
  BUY_EUWIN_CANCEL_MC_VIOLATE = 4,
  BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED = 5,
  BUY_NOWIN_CANCEL_MC_HAS_RETURNED = 6,
}

@Entity({ name: 'appeals' })
export class Appeal extends EntityBase {
  @Column({ name: 'operation_winner_id', nullable: true, length: 36 })
  public operationWinnerId?: string;

  @Column({ name: 'user_winner_id', nullable: true, length: 36 })
  public userWinnerId?: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'operation_winner_id' })
  public operationWinner?: Operation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_winner_id' })
  public userWinner?: User;

  @Column({ name: 'open_at' })
  public openAt: Date;

  @Column({ name: 'close_at', nullable: true })
  public closeAt?: Date;

  @Column({ name: 'actual_close_at', nullable: true })
  public actualCloseAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  public completedAt?: Date;

  @Column({ name: 'add_extra_at', nullable: true })
  public addExtraAt: Date;

  @Column({ name: 'evident_at', nullable: true })
  public evidentAt: Date;

  @Column({ name: 'decision_at', nullable: true })
  public decisionAt: Date;

  @Column({ name: 'decision_result', type: 'tinyint', nullable: true })
  public decisionResult?: SELL_APPEAL_RESULTS | BUY_APPEAL_RESULTS;

  @Column({ name: 'note', type: 'text', nullable: true })
  public note?: string;

  @Column({ name: 'status', type: 'tinyint', default: AppealStatus.OPEN })
  public status: AppealStatus;

  @Column({ name: 'admin_id', nullable: true, length: 36 })
  public adminId?: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'admin_id' })
  public admin?: Operation;

  @Column({ name: 'number_of_extension', nullable: false, default: 0 })
  public numberOfExtension: number;

  @OneToOne(() => Order, (order) => order.appeal, { nullable: true })
  @Type(() => Order)
  public order?: Order;

  @Column({ name: 'secret', length: 32, unique: true, nullable: true })
  public secret?: string;

  @AfterLoad()
  public isOpenAppeal() {
    return this.status === AppealStatus.OPEN;
  }
}
