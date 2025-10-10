import { Type } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BLOCKCHAIN_NETWORKS } from '@api/common/models/P2PEnum';
import { CryptoTransactionStatus } from './CryptoTransactionStatus';
import { Order } from './Order';

export enum TransactionStatus {
  PENDING = 1,
  SUCCEED = 2,
  FAILED = 3,
  UNKNOWN = 4,
}

export enum TransactionFailCode {
  INVALID_ADDRESS_SEND = 901,
  INVALID_ADDRESS_RECEIVE = 902,
  INVALID_AMOUNT = 903,
  INVALID_ASSET = 904,
  INVALID_NETWORK = 905,
  INVALID_TIME_SEND = 906,
  RPC_TIMEOUT = 907,
  TRANSACTION_TIMEOUT = 908,
  TRANSACTION_SEND_FAILED = 909,
  RPC_UNKNOW_ERROR = 910,
}

// status of blockchain
export enum TRANSACTION_RECEIPT_STATUS_TYPE {
  SUCCESS = 1,
  FAILED = 0,
}

@Entity({ name: 'crypto_transactions' })
export class CryptoTransaction {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt?: Date;

  @Column({ name: 'order_id', length: 36 })
  public orderId: string;

  @ManyToOne(() => Order, (order) => order.cryptoTransactions)
  @JoinColumn({ name: 'order_id' })
  @Type(() => Order)
  public order: Order;

  @OneToMany(() => CryptoTransactionStatus, (cryptoTxnStatus) => cryptoTxnStatus.cryptoTransaction, {
    cascade: true,
    eager: true,
  })
  @Type(() => CryptoTransaction)
  public cryptoTransactionStatus: CryptoTransactionStatus[];

  @Column({ name: 'hash' })
  public hash: string;

  @Column({ name: 'network', type: 'varchar', length: 30 })
  public network: BLOCKCHAIN_NETWORKS;

  @Column({ name: 'status', type: 'int', default: TransactionStatus.PENDING })
  public status: TransactionStatus;

  @Column({ name: 'fail_code', type: 'int', nullable: true })
  public failCode: TransactionFailCode;

  public isStatusMatch(status: TransactionStatus) {
    return this.status === status;
  }
}
