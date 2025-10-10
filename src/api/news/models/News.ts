import { Column, Entity } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';

@Entity({ name: 'news' })
export class News extends EntityBase {
  @Column({ name: 'content', type: 'text' })
  public content: string;

  @Column({ name: 'start', type: 'datetime' })
    public start: Date;

  @Column({ name: 'end', type: 'datetime' })
  public end: Date;
}
