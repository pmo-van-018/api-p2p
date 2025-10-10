import { BlacklistEntity } from '@api/blacklist/models/BlacklistEntity';
import { BlacklistBaseResponse } from '@api/blacklist/responses/BlacklistBaseResponse';
import { PaginationResult } from '@api/common/types';

export class BlacklistResponse {
  public blacklists: BlacklistBaseResponse[];
  public total: number;

  constructor(data: PaginationResult<BlacklistEntity>) {
    this.blacklists = data.items.map((blacklist) => new BlacklistBaseResponse(blacklist));
    this.total = data.totalItems;
  }
}
