import { BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS, AppealStatus, Appeal } from '@api/appeal/models/Appeal';
import { PaginationInput, SearchInput, SortOneInput, WhereConditions } from '@api/common/types';
import { TradeType } from '@api/common/models';

export type CloseAppeal = {
  status?: AppealStatus;
  adminId?: string;
  operationWinnerId?: string;
  userWinnerId?: string;
  decisionResult: SELL_APPEAL_RESULTS | BUY_APPEAL_RESULTS;
  decisionAt: Date;
  actualCloseAt?: Date;
};

export type AppealPendingStaffs = {
  merchantId: string;
  appealCount: number;
};

export type AdminFindConditions = WhereConditions<Pick<Appeal, 'adminId'>>
  & PaginationInput
  & SortOneInput
  & SearchInput
  & {
  orderStatus?: string[],
  appealStatus?: string[],
  orderType?: TradeType,
  assetId?: string,
};
