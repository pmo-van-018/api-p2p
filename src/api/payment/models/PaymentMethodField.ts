import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

import { PaymentMethod } from './PaymentMethod';

export enum CONTENT_TYPE_BANK {
  BANK_HOLDER = 'payee',
  BANK_NUMBER = 'pay_account',
  BANK_NAME = 'bank',
  BANK_REMARK = 'note',
}

@Entity({ name: 'payment_method_fields' })
export class PaymentMethodField extends EntityBase {
  @Column({ name: 'content_type' })
  public contentType: string;

  @Column({ name: 'name' })
  public name: string;

  @Column({ name: 'value' })
  public value: string;

  @Column({ name: 'payment_method_id', length: 36 })
  public paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.paymentMethodFields, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'payment_method_id' })
  public paymentMethod: PaymentMethod;

  /*  @BeforeInsert()
  @BeforeUpdate()
  protected async encryptValue() {
    if (this.value) {
      const paymentMethod = this.paymentMethod
        ? this.paymentMethod
        : await getManager().findOne(PaymentMethod, { where: { id: this.paymentMethodId } });
      this.value = Crypto.encrypt(this.value, paymentMethod.userId.toString());
    }
  }

  @AfterLoad()
  protected async decryptValue() {
    if (this.value) {
      try {
        const paymentMethod = this.paymentMethod
          ? this.paymentMethod
          : await getManager().findOne(PaymentMethod, { where: { id: this.paymentMethodId } });
        this.value = Crypto.decrypt(this.value, paymentMethod.userId.toString()) as string;
      } catch (error) {
        // prevent old data not encrypt, or edit directly from db
        console.error(`error decrypt value - ${this.value}: `, error);
      }
    }
  }*/
}
