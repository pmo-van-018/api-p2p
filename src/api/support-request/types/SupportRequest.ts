import {
  SupportRequestSortField,
  SupportRequestSearchType,
  SupportRequestType,
  SupportRequestQueryStatus
} from '@api/support-request/models/SupportRequestEnum';

export type SupportRequestQuery = {
  page: number,
  limit: number,
  type?: SupportRequestType;
  status?: SupportRequestQueryStatus;
  createdFrom?: string;
  createdTo?: string;
  searchField?: SupportRequestSearchType;
  searchValue?: string;
  completedFrom?: string;
  completedTo?: string;
  sortField?: SupportRequestSortField;
  sortType?: string;
  adminId?: string;
  received?: boolean;
};
