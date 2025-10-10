import { ObjectLiteral } from 'typeorm';

import { OperationType } from '@api/common/models/P2PEnum';

export type PaginationInput = {
  limit?: number;
  page?: number;
};

export type PaginationResult<T> = Readonly<{
  items: T[];
  totalItems: number;
  page?: number;
  totalPages?: number;
  limit?: number;
  currentUserType?: number;
}>;

export type PaginationResultNotification<T> = Readonly<{
  items: T[];
  totalItems: number;
  page?: number;
  totalPages?: number;
  limit?: number;
  totalUnread?: number;
  systemUnread?: number;
  transactionUnread?: number;
}>;

export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

export type SortInput = { sort?: Record<string, SortOrder>[] };

export type SortOneInput = { sortField?: string, sortDirection?: SortOrder };

export type SearchInput = { searchField?: string, searchValue?: string };

export type PickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};

export type WhereConditions<Entity> = Entity | ObjectLiteral;

export type MerchantType = PickEnum<
  OperationType,
  OperationType.MERCHANT_MANAGER | OperationType.MERCHANT_OPERATOR | OperationType.MERCHANT_SUPPORTER
>;

export type AppealWinner = {
  appeal_user_winner_id: string;
  appeal_operation_winner_id: string;
};

export type ValidateCryptoTransactionResult = {
  isValid: boolean;
  errorCode?: number;
}
