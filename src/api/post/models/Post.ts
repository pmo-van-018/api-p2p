import { Type } from 'class-transformer';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { Fiat } from '@api/master-data/models/Fiat';
import { Order } from '@api/order/models/Order';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { generateRefId } from '@base/utils/helper.utils';
import BigNumber from 'bignumber.js';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { Asset } from '@api/master-data/models/Asset';
import { Operation } from '@api/profile/models/Operation';

@Entity({ name: 'posts' })
@Index(['assetId', 'status', 'type', 'fiatId', 'isShow', 'realPrice'])
@Index(['status', 'type', 'isShow', 'realPrice'])
export class Post extends EntityBase {
  @Column({ name: 'merchant_id', length: 36 })
  public merchantId: string;

  @Column({ name: 'ref_id', length: 20 })
  public refId: string;

  @ManyToOne(() => Operation, (merchant) => merchant.posts)
  @JoinColumn({ name: 'merchant_id' })
  @Type(() => Operation)
  public merchant: Operation;

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

  @Column({ name: 'payment_method_id', nullable: true, length: 36 })
  public paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.posts, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'payment_method_id' })
  public paymentMethod?: PaymentMethod;

  @Column({ name: 'status', type: 'tinyint', default: PostStatus.ONLINE })
  public status: PostStatus;

  /**
   * Type: Crypto.
   */
  @Column({ name: 'available_amount', type: 'decimal', precision: 27, scale: 8 })
  public availableAmount: number;

  /**
   * Type: Crypto.
   */
  @Column({ name: 'total_amount', type: 'decimal', precision: 27, scale: 8 })
  public totalAmount: number;

  /**
   * Type: Crypto.
   */
  @Column({ name: 'finished_amount', type: 'decimal', precision: 27, scale: 8 })
  public finishedAmount: number;

  /**
   * Type: Crypto.
   */
  @Column({ name: 'block_amount', type: 'decimal', precision: 27, scale: 8 })
  public blockAmount: number;

  /**
   * Type: Fiat.
   */
  @Column({ name: 'max_order_amount', type: 'decimal', precision: 27, scale: 8 })
  public maxOrderAmount: number;

  /**
   * Type: Fiat.
   */
  @Column({ name: 'min_order_amount', type: 'decimal', precision: 27, scale: 8 })
  public minOrderAmount: number;

  @Column({ name: 'payment_time_limit' })
  public paymentTimeLimit: number;

  @Column({ name: 'price', type: 'decimal', precision: 27, scale: 8 })
  public price: number;

  @Column({ name: 'total_fee', type: 'decimal', precision: 35, scale: 8 })
  public totalFee: number;

  @Column({ name: 'total_penalty_fee', type: 'decimal', precision: 35, scale: 8 })
  public totalPenaltyFee: number;

  @Column({ name: 'real_price', type: 'decimal', precision: 27, scale: 8 })
  public realPrice: number;

  @Column({ name: 'type', type: 'varchar', length: 5, default: TradeType.SELL })
  public type: TradeType;

  @OneToMany(() => Order, (order) => order.post)
  public orders?: Order[];

  @Column({ name: 'note', type: 'text', nullable: true })
  public note?: string;

  @Column({ name: 'is_show', type: 'boolean', default: false })
  public isShow: boolean;

  @Column({ name: 'updated_by', nullable: true, length: 36 })
  public updatedBy?: string;

  @Column({ name: 'created_by', nullable: true, length: 36 })
  public createdBy?: string;

  @Column({ name: 'benchmark_price', type: 'decimal', precision: 27, scale: 8, default: 0, nullable: true })
  public benchmarkPrice: number;

  @Column({ name: 'benchmark_percent', type: 'decimal', precision: 7, scale: 4, nullable: true, default: 0 })
  public benchmarkPercent: number;

  public numberCheck(num: number | string): number {
    const powNumber = new BigNumber(10).pow(9).toNumber();
    return new BigNumber(num).multipliedBy(powNumber).toNumber();
  }

  public hasRealPriceNotEqualTo(price: number): boolean {
    return this.numberCheck(this.realPrice) !== this.numberCheck(price);
  }

  public hasAmountAvailableLessThan(amount: number | string): boolean {
    return this.numberCheck(this.availableAmount) < this.numberCheck(amount);
  }

  public hasMinOrderAmountGreaterThan(totalPrice: number) {
    return this.numberCheck(this.minOrderAmount) > this.numberCheck(totalPrice);
  }

  public hasMaxOrderAmountLessThan(totalPrice: number) {
    return this.numberCheck(this.maxOrderAmount) < this.numberCheck(totalPrice);
  }

  public hasAvailableAmountLessThanMinAmount(): boolean {
    // because availableAmout is crypto, minOrderAmount is fiat, so you need to convert them to same type before comparing.
    // https://docs.google.com/spreadsheets/d/1cb3FN2PAhmWQR4PoPgmZRhCYQSyIrRM3oxV0QXQ2cBg/edit#gid=0
    const minOrderAmountToCrypto = new BigNumber(this.minOrderAmount).dividedBy(this.realPrice).toNumber();
    return this.numberCheck(this.availableAmount) < this.numberCheck(minOrderAmountToCrypto);
  }

  @BeforeInsert()
  public beforeInsert() {
    this.refId = generateRefId();
    this.toggleShowPost();
  }

  @BeforeUpdate()
  public BeforeUpdate() {
    this.toggleShowPost();
  }

  @BeforeInsert()
  protected auditInsert() {
    this.createdBy = this.merchantId;
    this.updatedBy = this.merchantId;
  }

  private toggleShowPost() {
    // hide all posts with available amount less than min order amount,
    // because availableAmout is crypto, minOrderAmount is fiat, so you need to convert them to same type before comparing.
    // https://docs.google.com/spreadsheets/d/1cb3FN2PAhmWQR4PoPgmZRhCYQSyIrRM3oxV0QXQ2cBg/edit#gid=0
    this.isShow = this.availableAmount > this.minOrderAmount / this.realPrice;
  }
}
