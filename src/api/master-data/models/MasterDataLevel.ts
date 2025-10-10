import { Column, Entity } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { FEE_RATE, MAX_MERCHANT_OPERATOR, MAX_ORDER_LIMIT, MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';

@Entity({ name: 'master_data_levels' })
export class MasterDataLevel extends EntityBase {
  @Column({ name: 'merchant_level', nullable: false, unique: true, default: MIN_MERCHANT_LEVEL })
  public merchantLevel: number;

  @Column({
    name: 'fee',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: FEE_RATE,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  public fee: number;

  @Column({ name: 'max_order_limit', default: MAX_ORDER_LIMIT })
  public maxOrderLimit: number;

  @Column({ name: 'max_merchant_operator', default: MAX_MERCHANT_OPERATOR })
  public maxMerchantOperator: number;

  @Column({ name: 'created_by_id', length: 36 })
  public createdById: string;

  @Column({ name: 'updated_by_id', nullable: true, length: 36 })
  public updatedById: string;
}
