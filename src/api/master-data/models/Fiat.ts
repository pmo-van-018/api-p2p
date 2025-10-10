import { Column, Entity } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

@Entity({ name: 'fiats' })
export class Fiat extends EntityBase {
  @Column({ name: 'name' })
  public name: string;

  @Column({ name: 'logo', nullable: true })
  public logo?: string;

  @Column({ name: 'precision', default: 0 })
  public precision: number;

  @Column({ name: 'symbol', length: 10 })
  public symbol: string;
}
