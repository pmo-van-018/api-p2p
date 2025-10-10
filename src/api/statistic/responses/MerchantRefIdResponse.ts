import {PaginationResult} from '@api/common/types';
import {Operation} from '@api/profile/models/Operation';

export class MerchantRefIdResponse {
  public items: string[];
  public total: number;

  constructor(data: PaginationResult<Operation>) {
    this.items = data.items.map(item => item.refId);
    this.total = data.totalItems;
  }
}
