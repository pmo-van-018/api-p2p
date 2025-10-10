import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { find } from 'lodash';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { PaymentMethodType } from '@api/common/models/P2PEnum';
import { PaymentMethodField } from './PaymentMethodField';
import { Type } from 'class-transformer';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { Post } from '@api/post/models/Post';

@Entity({ name: 'payment_methods' })
export class PaymentMethod extends EntityBase {
  @Column({ name: 'user_id', length: 36, nullable: true })
  public userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  public operation: Operation;

  @Column({ name: 'operation_id', length: 36, nullable: true })
  public operationId: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  public type: PaymentMethodType;

  @Column({ name: 'method_name' })
  public methodName: string;

  @Column({ name: 'method_short_name' })
  public methodShortName: string;

  @OneToMany(() => PaymentMethodField, (paymentMethodField) => paymentMethodField.paymentMethod, {
    cascade: ['remove', 'update'],
  })
  @Type(() => PaymentMethodField)
  public paymentMethodFields: PaymentMethodField[];

  @OneToMany(() => Post, (post) => post.paymentMethod)
  public posts: Post[];

  @AfterLoad()
  public getPaymentMethodField(type: string): string {
    const paymentMethodFieldFound = find(this.paymentMethodFields, ['contentType', type]);
    return paymentMethodFieldFound ? paymentMethodFieldFound.value : '';
  }
}
