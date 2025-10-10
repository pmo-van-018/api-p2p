import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './Order';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { PaymentTicketStatus } from '../enums/PaymentTicketEnum';

@Entity({ name: 'payment_tickets' })
export class PaymentTicket {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: false })
  public orderId: string;

  @JoinColumn({ name: 'order_id' })
  @ManyToOne(() => Order)
  public order: Order;

  @Column({ name: 'note', type: 'varchar', nullable: false })
  public note: string;

  @Column({ name: 'receiver', type: 'varchar', nullable: false })
  public receiver: string;

  @Column({ name: 'bank_no', type: 'varchar', nullable: false })
  public bankNo: string;

  @Column({ name: 'gateway', type: 'varchar', nullable: false })
  public gateway: string;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: false })
  public paymentMethodId: string;

  @JoinColumn({ name: 'payment_method_id' })
  @ManyToOne(() => PaymentMethod)
  public paymentMethod: PaymentMethod;

  @Column({ name: 'amount', type: 'decimal', nullable: false, precision: 27, scale: 8 })
  public amount: number;

  @Column({ name: 'type', type: 'varchar', nullable: false })
  public type: string;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  public status: PaymentTicketStatus;

  @Column({ name: 'credit_draw_by', type: 'varchar', nullable: false })
  public creditDrawBy: string;

  @Column({ name: 'credit_draw_at', type: 'datetime', nullable: true })
  public creditDrawAt: Date;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  public cancelledAt: Date;

  @Column({ name: 'picked_at', type: 'datetime', nullable: true })
  public pickedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @Column({ name: 'payload_log', type: 'text', nullable: true })
  public payloadLog: string;
}
