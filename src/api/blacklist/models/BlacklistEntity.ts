import { Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BLACKLIST_INSERTED_TYPE {
  MANUAL = 1,
  CRAWL = 2,
}

@Entity({ name: 'blacklists' })
export class BlacklistEntity {
  @PrimaryGeneratedColumn('uuid')
  @Length(36)
  public id: string;

  @Column({ name: 'wallet_address', unique: true, nullable: false })
  public walletAddress: string;

  @Column({ name: 'type', type: 'tinyint', nullable: false })
  public type: BLACKLIST_INSERTED_TYPE;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
}
