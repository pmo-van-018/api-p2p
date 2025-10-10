import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Type } from 'class-transformer';
import { Operation } from './Operation';
import { Asset } from '@api/master-data/models/Asset';

@Entity({ name: 'balance_configurations' })
@Index(['assetId', 'managerId'], {unique: true})
export class BalanceConfiguration extends EntityBase {
  @Column({ name: 'asset_id', length: 36, nullable: false })
  public assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  @Type(() => Asset)
  public asset: Asset;

  @Column({ name: 'manager_id', nullable: true, length: 36 })
  public managerId: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'manager_id' })
  @Type(() => Operation)
  public manager: Operation;

  @Column({ name: 'balance', type: 'decimal', precision: 30, scale: 15, default: 0 })
  public balance: number;
}
