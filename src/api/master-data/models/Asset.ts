import { Column, Entity } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { BLOCKCHAIN_NETWORKS } from '@api/common/models/P2PEnum';

@Entity({ name: 'assets' })
export class Asset extends EntityBase {
  @Column({ name: 'symbol', length: 10 })
  public symbol: string;

  @Column({ name: 'name' })
  public name: string;

  @Column({ name: 'network', type: 'varchar', length: 30 })
  public network: BLOCKCHAIN_NETWORKS;

  @Column({ name: 'logo', nullable: true })
  public logo?: string;

  @Column({ name: 'precision', default: 0 })
  public precision: number;

  @Column({ name: 'contract', length: 50, nullable: true })
  public contract: string;

  @Column({ name: 'order_number', nullable: true })
  public orderNumber: number;
}
