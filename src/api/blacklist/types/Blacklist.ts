import { BLACKLIST_INSERTED_TYPE } from '@api/blacklist/models/BlacklistEntity';

export type QueryBlacklistParams = {
  limit: number;
  page: number;
  search?: string;
  type?: BLACKLIST_INSERTED_TYPE;
  orderField?: 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
};
