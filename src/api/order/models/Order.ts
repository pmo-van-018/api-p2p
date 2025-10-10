import { Type } from 'class-transformer';
import moment from 'moment';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TradeType } from '@api/common/models/P2PEnum';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Fiat } from '@api/master-data/models/Fiat';
import { Appeal } from '../../appeal/models/Appeal';
import { Asset } from '../../master-data/models/Asset';
import { PaymentMethod } from '../../payment/models/PaymentMethod';
import { Post } from '../../post/models/Post';
import { User } from '../../profile/models/User';
import { Operation } from '../../profile/models/Operation';
import { CryptoTransaction } from './CryptoTransaction';
import { env } from '@base/env';
import { OrderConfiguration } from '../types/Order';
import { PaymentTicket } from './PaymentTicket';

export enum OrderStatus {
  TO_BE_PAID = 1,
  CONFIRM_PAID = 2,
  PAID = 3,
  COMPLETED = 4,
  CANCELLED = 5,
}

export enum BUY_ORDER_STEPS {
  BUY_ORDER_CREATED_BY_USER = 1,
  BUY_ORDER_CREATED_BY_USER_DEAL_TIME = 2,
  BUY_NOTIFY_SENT_FIAT_BY_USER = 3,
  BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME = 4,
  BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT = 5,
  BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT = 6,
  BUY_CONFIRMED_FIAT_BY_MERCHANT = 7,
  BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME = 8,
  BUY_SENDING_CRYPTO_BY_MERCHANT = 9,
  BUY_SENDING_CRYPTO_FAILED = 10,
  BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED = 11,
  BUY_SENDING_CRYPTO_SUCCESS = 12,
  BUY_ORDER_CANCELLED_BY_USER = 13,
  BUY_ORDER_CANCELLED_BY_SYSTEM = 14,
}

export enum SELL_ORDER_STEP {
  SELL_ORDER_CREATED_BY_USER = 1,
  SELL_SENDING_CRYPTO_BY_USER = 2,
  SELL_SENDING_CRYPTO_FAILED = 3,
  SELL_SENDING_CRYPTO_SUCCESS = 4,
  SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME = 5,
  SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME = 6,
  SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT = 7,
  SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER = 8,
  SELL_CONFIRMED_FIAT_BY_USER = 9,
  SELL_ORDER_CANCELLED_BY_USER = 10,
  SELL_ORDER_CANCELLED_BY_SYSTEM = 11,
}

export type PaymentInfo = {
  paymentMethodId: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

   
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'ref_id', length: 20 })
  public refId: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt?: Date;

  @Column({ name: 'user_id', length: 36 })
  public userId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  public user: User;

  @Column({ name: 'merchant_id', length: 36 })
  public merchantId: string;

  @ManyToOne(() => Operation, (merchant) => merchant.orders)
  @JoinColumn({ name: 'merchant_id' })
  @Type(() => Operation)
  public merchant: Operation;

  @Column({ name: 'supporter_id', nullable: true, length: 36 })
  public supporterId: string;

  @ManyToOne(() => Operation, (merchant) => merchant.orders)
  @JoinColumn({ name: 'supporter_id' })
  @Type(() => Operation)
  public supporter: Operation;

  @Column({ name: 'asset_id', length: 36 })
  public assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  @Type(() => Asset)
  public asset: Asset;

  @Column({ name: 'fiat_id', length: 36 })
  public fiatId: string;

  @ManyToOne(() => Fiat)
  @JoinColumn({ name: 'fiat_id' })
  @Type(() => Fiat)
  public fiat: Fiat;

  @Column({ name: 'post_id', length: 36 })
  public postId: string;

  @ManyToOne(() => Post, (post) => post.orders)
  @JoinColumn({ name: 'post_id' })
  @Type(() => Post)
  public post: Post;

  @Column({ name: 'amount', type: 'decimal', precision: 27, scale: 8 })
  public amount: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 27, scale: 8 })
  public totalPrice: number;

  @Column({ name: 'request_amount', type: 'decimal', precision: 27, scale: 8 })
  public requestAmount: number;

  @Column({ name: 'request_total_price', type: 'decimal', precision: 27, scale: 8 })
  public requestTotalPrice: number;

  @Column({ name: 'price', type: 'decimal', precision: 27, scale: 8 })
  public price: number;

  @Column({ name: 'status', type: 'tinyint' })
  public status: OrderStatus;

  @Column({ name: 'step', type: 'tinyint' })
  public step: number;

  @Column({ name: 'appeal_id', nullable: true, length: 36 })
  public appealId?: string;

  @OneToOne(() => Appeal)
  @JoinColumn({ name: 'appeal_id' })
  @Type(() => Appeal)
  public appeal?: Appeal;

  @Column({ name: 'type', type: 'varchar', length: 5, default: TradeType.SELL })
  public type: TradeType;

  @Column({ name: 'created_time' })
  public createdTime: Date;

  @Column({ name: 'completed_time', nullable: true })
  public completedTime?: Date;

  @Column({ name: 'ended_time' })
  public endedTime: Date;

  @Column({ name: 'payment_method_id', nullable: true, length: 36 })
  public paymentMethodId: string;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'payment_method_id' })
  @Type(() => PaymentMethod)
  public paymentMethod: PaymentMethod;

  @Column({ name: 'fee', type: 'decimal', precision: 10, scale: 4 })
  public fee: number;

  @Column({ name: 'penalty_fee', type: 'decimal', precision: 10, scale: 4 })
  public penaltyFee: number;

  @OneToMany(() => CryptoTransaction, (transaction) => transaction.order)
  @Type(() => CryptoTransaction)
  public cryptoTransactions: CryptoTransaction[];

  @Column({ name: 'cancel_by_operation_id', nullable: true, length: 36 })
  public cancelByOperationId?: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'cancel_by_operation_id' })
  public cancelByOperation?: Operation;

  @Column({ name: 'cancel_by_user_id', nullable: true, length: 36 })
  public cancelByUserId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancel_by_user_id' })
  public cancelByUser?: User;

  @Column({ name: 'confirm_hash_by_supporter_id', nullable: true, length: 36 })
  public confirmHashBySupporterId?: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'confirm_hash_by_supporter_id' })
  public confirmHashBySupporter?: Operation;

  @Column({ name: 'trans_code', nullable: true })
  public transCode?: string;

  @Column({ name: 'total_fee', type: 'decimal', precision: 35, scale: 8, nullable: true })
  public totalFee: number;

  @Column({ name: 'total_penalty_fee', type: 'decimal', precision: 35, scale: 8, nullable: true })
  public totalPenaltyFee: number;

  @Column({ name: 'appeal_resolved', type: 'boolean', nullable: true })
  public appealResolved: boolean;

  @Column({ name: 'room_id', nullable: true, length: 36, unique: true })
  public roomId: string;

  @Column({ name: 'configuration', nullable: true, type: 'json' })
  public configuration: OrderConfiguration;

  @Column({ name: 'benchmark_price', type: 'decimal', precision: 27, scale: 8, default: 0, nullable: true })
  public benchmarkPrice: number;

  @Column({ name: 'benchmark_percent', type: 'decimal', precision: 27, scale: 8, nullable: true, default: 0 })
  public benchmarkPercent: number;

  @Column({ name: 'benchmark_price_at_created', type: 'decimal', precision: 27, scale: 8, default: 0, nullable: true })
  public benchmarkPriceAtCreated: number;

  @Column({ name: 'benchmark_price_at_sent', type: 'decimal', precision: 27, scale: 8, default: 0, nullable: true })
  public benchmarkPriceAtSent: number;

  @Column({ name: 'is_payment_from_another_account', type: 'boolean', default: false })
  public isPaymentFromAnotherAccount: boolean;

  @Column({ name: 'payment_info', type: 'json', default: null, nullable: true })
  public paymentInfo: PaymentInfo;

  @OneToMany(() => PaymentTicket, (pt) => pt.order)
  public paymentTickets: PaymentTicket[];

  @AfterLoad()
  public convertType() {
    this.price = Number(this.price);
    this.amount = Number(this.amount);
    this.totalPrice = Number(this.totalPrice);
    this.requestAmount = Number(this.requestAmount);
    this.requestTotalPrice = Number(this.requestTotalPrice);
  }

  public isStatusNotEqual(status: OrderStatus) {
    return this.status !== status;
  }

  public isStatusEqual(status: OrderStatus) {
    return this.status === status;
  }

  public isStepEqual(step: BUY_ORDER_STEPS) {
    return this.step === step;
  }

  public isStepNotEqual(step: BUY_ORDER_STEPS | SELL_ORDER_STEP) {
    return this.step !== step;
  }

  public isExpiredEndTime(): boolean {
    return (
      this.step !== BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT &&
      moment.utc().toDate() > moment(this.endedTime).add(env.mercy.timeout, 'second').toDate()
    );
  }

  public isUserCancelExpired() {
    return this.status !== OrderStatus.TO_BE_PAID || this.isExpiredEndTime();
  }

  public isUserPaymentExpired() {
    return (
      this.step !== BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER ||
      moment.utc().toDate() > moment(this.endedTime).add(env.mercy.timeout, 'second').toDate()
    );
  }

  public isCountdownAutoCancel() {
    return (
      (this.type === TradeType.BUY && this.step === BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM) ||
      (this.type === TradeType.SELL && this.step === SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM)
    );
  }

  public hasBuyCountdownStep() {
    return [
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER,
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
      BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ].some((step) => step === this.step);
  }

  public isAppealTimeoutByStep() {
    return (
      this.type === TradeType.BUY &&
      [
        BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      ].includes(this.step)
    );
  }

  public hasCountdownTimer(): boolean {
    return this.hasBuyCountdownStep() || this.hasSellCountdownStep() || this.isAppealTimeoutByStep();
  }

  public hasSellCountdownStep() {
    return [
      SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    ].some((step) => step === this.step);
  }

  public isCompareIncorrectAmount(value: number | string): boolean {
    if (!value) {
      return false;
    }
    return Helper.trunc(Number(this.amount), 2) !== Helper.trunc(Number(value), 2);
  }

  public isEnableAppeal() {
    return (
      (this.type === TradeType.SELL &&
        [
          SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
          SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
          SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
        ].includes(this.step)) ||
      (this.type === TradeType.BUY &&
        [
          BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
          BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
          BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
          BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
          BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
        ].includes(this.step))
    );
  }

  public isContactAdmin() {
    return (
      (this.type === TradeType.SELL &&
        [SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER].includes(this.step)) ||
      (this.type === TradeType.BUY &&
        ([
          BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
          BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
        ].includes(this.step) ||
          this.isBuyReOpenOrder()))
    );
  }

  public isBuyReOpenOrder() {
    return (
      this.type === TradeType.BUY &&
      [BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME, BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED].includes(
        this.step
      ) &&
      this.appealId
    );
  }

  public isBuyTradeType(): boolean {
    return this.type === TradeType.BUY;
  }

  public isSellTradeType(): boolean {
    return this.type === TradeType.SELL;
  }

  public isFinished(): boolean {
    return [OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(this.status);
  }
}
