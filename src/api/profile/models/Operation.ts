import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { OperationStatus, OperationType, NotificationType } from '@api/common/models/P2PEnum';
import { MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { NotificationUser } from '@api/notification/models/NotificationUser';
import { Order } from '@api/order/models/Order';
import { Statistic } from '@api/statistic/models/Statistic';
import { Post } from '@api/post/models/Post';
import { P2PError } from '@api/common/errors/P2PError';
import { UserError } from '@api/profile/errors/UserError';
import { generateRefId } from '@base/utils/helper.utils';
import { SupportRequest } from '@api/support-request/models/SupportRequest';
import { getNamespace } from 'continuation-local-storage';
import { CURRENT_USER_ID, SECURITY_NAMESPACE } from '@api/middlewares/ClsMiddleware';
import { Auditable } from '@api/infrastructure/abstracts/Auditable';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';

@Entity({ name: 'operations' })
export class Operation extends EntityBase implements Auditable {
  @Column({ name: 'wallet_address', unique: true, nullable: true })
  public walletAddress: string;

  @Column({
    name: 'type',
    type: 'tinyint',
    default: OperationType.MERCHANT_SUPPORTER,
  })
  public type: OperationType;

  @Column({ name: 'merchant_level', type: 'tinyint', nullable: true, default: MIN_MERCHANT_LEVEL })
  public merchantLevel?: number;

  @Column({ name: 'merchant_manager_id', nullable: true, length: 36 })
  public merchantManagerId: string;

  @ManyToOne(() => Operation, (operation: Operation) => operation.merchantOperators, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchant_manager_id' })
  public merchantManager: Operation;

  @OneToMany(() => Operation, (operation: Operation) => operation.merchantManager, { nullable: true })
  public merchantOperators: Operation[];

  @Column({ name: 'contract_from', nullable: true })
  public contractFrom?: Date;

  @Column({ name: 'contract_to', nullable: true })
  public contractTo?: Date;

  @ManyToOne(() => MasterDataLevel)
  @JoinColumn({ name: 'merchant_level', referencedColumnName: 'merchantLevel' })
  public masterDataLevel?: MasterDataLevel;

  @Index({ fulltext: true })
  @Column({ name: 'nick_name', nullable: true, unique: true })
  public nickName?: string;

  @OneToMany(() => Order, (order) => order.merchant)
  public orders?: Order[];

  @OneToMany(() => Post, (post) => post.merchant)
  public posts: Post[];

  @OneToMany(() => SupportRequest, (supportRequest) => supportRequest.admin)
  public supportRequests?: SupportRequest[];

  @Column({ name: 'statistic_id', nullable: true, length: 36 })
  public statisticId?: string;

  @OneToOne(() => Statistic, (statistic) => statistic.operation)
  @JoinColumn({ name: 'statistic_id' })
  public statistic: Statistic;

  @Column({ name: 'lock_end_time', nullable: true })
  public lockEndTime?: Date | null;

  @Column({ name: 'skip_note_at', nullable: true })
  public skipNoteAt?: Date | null;

  @Column({ name: 'activated_at', nullable: true })
  public activatedAt?: Date | null;

  @Column({ name: 'last_login_at', nullable: true })
  public lastLoginAt?: Date | null;

  @Column({ name: 'status', type: 'tinyint', default: OperationStatus.ACTIVE })
  public status: OperationStatus;

  @Column({ name: 'peer_chat_id', nullable: true, length: 36 })
  public peerChatId?: string;

  @Column({ name: 'ref_id', unique: true, length: 20, nullable: false })
  public refId: string;

  @Column({ name: 'avatar', nullable: true, length: 64 })
  public avatar?: string;

  @Column({
    name: 'allow_notification',
    type: 'simple-array',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => value?.map((v) => Number(v)),
    },
  })
  public allowNotification: NotificationType[];

  @OneToMany(() => NotificationUser, (notificationUser) => notificationUser.operation)
  public notificationOperators?: NotificationUser[];

  @Column({ name: 'updated_by', nullable: true, length: 36 })
  public updatedBy?: string;

  @Column({ name: 'created_by', nullable: true, length: 36 })
  public createdBy?: string;

  @OneToOne(() => TwoFactorAuth, (twoFactorAuth) => twoFactorAuth.operation)
  public twoFactorAuth: TwoFactorAuth;

  @Column({ name: 'allow_gasless', type: 'boolean', default: false })
  public allowGasless: boolean;

  @Column({ name: 'gasles_trans_limit', type: 'decimal', precision: 27, scale: 8, default: 0 })
  public gaslessTransLimit: number;

  @BeforeInsert()
  protected generateRefId() {
    this.refId = generateRefId();
  }

  // for case using save, not using insert
  @BeforeInsert()
  protected auditInsert() {
    const reqActorId = getNamespace(SECURITY_NAMESPACE).get(CURRENT_USER_ID)?.id ?? 'undefined';
    this.createdBy = reqActorId;
    this.updatedBy = reqActorId;
  }

  @BeforeInsert()
  @BeforeUpdate()
  protected validateDateContract(): void {
    const invalidDateContract = this.contractFrom && this.contractTo && this.contractFrom > this.contractTo;
    if (invalidDateContract) {
      throw new P2PError(UserError.DATE_CONTRACT_IS_INVALID);
    }
  }
}
