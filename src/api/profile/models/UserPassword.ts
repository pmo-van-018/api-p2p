import { Column, Entity } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

@Entity({ name: 'user_password' })
export class UserPassword extends EntityBase {
  @Column({ name: 'username', unique: true })
  public username: string;

  @Column({ name: 'password', type: 'text' })
  public password: string;
}
