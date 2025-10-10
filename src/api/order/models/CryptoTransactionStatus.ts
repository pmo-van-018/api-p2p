import { hashMd5 } from '@base/utils/hash.utils';
import { Type } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CryptoTransaction, TransactionStatus } from './CryptoTransaction';

@Entity({ name: 'crypto_transaction_statuses' })
export class CryptoTransactionStatus {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @Column({ name: 'rpc', type: 'text', nullable: false })
  public rpc: string;

  @Column({ name: 'rpc_hash', type: 'varchar', length: 32, nullable: false })
  public rpcHash: string;

  @Column({ name: 'status', type: 'int', default: 1 })
  public status: TransactionStatus;

  @ManyToOne(() => CryptoTransaction, (cryptoTxn) => cryptoTxn.cryptoTransactionStatus, {
    eager: false,
  })
  @JoinColumn({ name: 'crypto_transaction_id' })
  @Type(() => CryptoTransaction)
  public cryptoTransaction: CryptoTransaction;

  @BeforeInsert()
  protected beforeInsert() {
    this.rpcHash = hashMd5(this.rpc);
  }
}
