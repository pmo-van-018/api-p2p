import { Column, Entity, OneToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';

@Entity({ name: 'volume' })
export class Volume extends EntityBase {
  @Column({ name: 'user_id', length: 36, nullable: true })
  public userId: string;

  @OneToOne(() => User, (user) => user.id)
  public user: User;

  @Column({ name: 'operation_id', length: 36, nullable: true })
  public operationId: string;

  @OneToOne(() => Operation, (operation) => operation.id)
  public operation: Operation;

  @Column({ name: 'date_trans', nullable: true })
  public dateTrans: Date;

  @Column({ name: 'number_transaction_sell', default: 0 })
  public numberTransactionSell: number;

  @Column({ name: 'number_transaction_buy', default: 0 })
  public numberTransactionBuy: number;

  @Column({ name: 'number_transaction_success', default: 0 })
  public numberTransactionSuccess: number;

  @Column({ name: 'number_transaction_cancelled', default: 0 })
  public numberTransactionCancelled: number;

  @Column({ name: 'number_transaction_appeal', default: 0 })
  public numberTransactionAppeal: number;

  @Column({ name: 'amount_transaction', type: 'decimal', precision: 27, scale: 8 })
  public amountTransaction: number;

  @Column({ name: 'total_fee', type: 'decimal', precision: 27, scale: 8 })
  public totalFee: number;

  @Column({ name: 'total_penalty_fee', type: 'decimal', precision: 27, scale: 8 })
  public totalPenaltyFee: number;
}
