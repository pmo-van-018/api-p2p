import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../profile/models/User';
import { Operation } from '../../profile/models/Operation';
import { TwoFactorAuthStatus } from '../enums/TwoFactorAuth';

@Entity({ name: 'two_factor_auth' })
export class TwoFactorAuth {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'user_id', length: 36, nullable: true })
  public userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({ name: 'operation_id', length: 36, nullable: true })
  public operationId: string;

  @OneToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  public operation: Operation;

  @Column({ name: 'totp_secret', nullable: true })
  public totpSecret?: string;

  @Column({ name: 'totp_status', type: 'tinyint', nullable: true, default: TwoFactorAuthStatus.DISABLED })
  public totpStatus?: TwoFactorAuthStatus;

  public isEnabled2FA(): boolean {
    return this.totpStatus === TwoFactorAuthStatus.ENABLED;
  }

  public isValid2FA(): boolean {
    return this.isEnabled2FA() && this.totpSecret && this.totpSecret !== '';
  }
}
