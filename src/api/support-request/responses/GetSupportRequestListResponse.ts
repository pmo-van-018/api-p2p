import { PaginationResult } from '@api/common/types';
import { GetSupportRequestDetailResponse } from '@api/support-request/responses/GetSupportRequestDetailResponse';
import { SupportRequest } from '@api/support-request/models/SupportRequest';

export class GetSupportRequestListResponse {
  public supportRequests: GetSupportRequestDetailResponse[];
  public total: number;

  constructor(data: PaginationResult<SupportRequest>) {
    this.supportRequests = data.items.map(item => new GetSupportRequestDetailResponse(item));
    this.total = data.totalItems;
  }
}
