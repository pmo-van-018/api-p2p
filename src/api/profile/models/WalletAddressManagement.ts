import { Column, Entity,  JoinColumn, ManyToOne } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Operation } from '@api/profile/models/Operation';
import { WalletAddressStatus } from '@api/common/models';

@Entity({ name: 'wallet_address_managements' })
export class WalletAddressManagement extends EntityBase {
  @Column({ name: 'wallet_address', unique: true, nullable: false })
  public walletAddress: string;

  @Column({ name: 'operation_id', nullable: false, length: 36 })
  public operationId: string;

  @ManyToOne(() => Operation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'operation_id' })
  public operation: Operation;

  @Column({ name: 'status', type: 'enum', enum: WalletAddressStatus, default: WalletAddressStatus.INACTIVE })
  public status: WalletAddressStatus;
}
