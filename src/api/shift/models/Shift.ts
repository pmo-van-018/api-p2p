import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Operation } from '@api/profile/models/Operation';
import { AssetBalance } from '@api/shift/types/AssetBalance';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

export enum ShiftStatus {
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  APPROVED = 'APPROVED',
}

@Entity({ name: 'shifts' })
@Index(['createdAt'])
export class Shift extends EntityBase {
  @Column({ type: 'varchar', length: 36, name: 'operation_id', nullable: false })
  public operationId: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  public operation: Operation;

  @Column({ type: 'datetime', nullable: false, name: 'check_in_at' })
  public checkInAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'check_out_at' })
  public checkOutAt: Date;

  @Column({ type: 'json', nullable: false, name: 'start_balance_amount' })
  public startBalanceAmount: AssetBalance[];

  @Column({ type: 'json', nullable: true, name: 'end_balance_amount' })
  public endBalanceAmount: AssetBalance[];

  @Column({ type: 'decimal', precision: 64, scale: 18, nullable: true, name: 'total_volume' })
  public totalVolume: number;

  @Column({
    enum: ShiftStatus,
    type: 'enum',
    default: ShiftStatus.PROCESSING,
    nullable: false,
  })
  public status: ShiftStatus;
}
