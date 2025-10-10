import { BlacklistEntity } from '@api/blacklist/models/BlacklistEntity';
import { QueryBlacklistParams } from '@api/blacklist/types/Blacklist';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { EntityRepository, SelectQueryBuilder } from 'typeorm';

@EntityRepository(BlacklistEntity)
export class BlacklistRepository extends RepositoryBase<BlacklistEntity> {

  public async getBlacklistsAndCount(data: QueryBlacklistParams): Promise<[BlacklistEntity[], number]> {
    const { limit, page, orderDirection, orderField, search, type } = data;

    const qb = this.createQueryBuilder('blacklist');

    if (search) {
      qb.andWhere('LOWER(blacklist.walletAddress) = LOWER(:search)', { search });
    }

    if (data.type) {
      qb.andWhere('blacklist.type = :type', { type });
    }

    this.buildSort(qb, orderField, orderDirection);

    qb.skip(limit * (page - 1)).take(limit);

    return await qb.getManyAndCount();
  }

  private buildSort<T>(queryBuilder: SelectQueryBuilder<T>, orderField: 'createdAt', orderDirection: 'ASC' | 'DESC') {
    if (orderField && orderDirection) {
      queryBuilder.addOrderBy(`${queryBuilder.alias}.${orderField}`, orderDirection);
    }
    return queryBuilder;
  }
}
