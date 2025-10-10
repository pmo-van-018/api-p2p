import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { News } from '@api/news/models/News';

@EntityRepository(News)
export class NewsRepository extends BaseRepository<News> {}
