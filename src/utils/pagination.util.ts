import { MAX_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE, MIN_PAGINATION_LIMIT } from '@api/common/models/P2PConstant';
import { PaginationInput, PaginationResult, PaginationResultNotification } from '@api/common/types';

export class PaginationUtil {
  public static paginate<ResultType>(
    results: PaginationResult<ResultType>,
    query: PaginationInput & Record<any, any>
  ): PaginationResult<ResultType> {
    const { limit, page } = this.parseTakeSkipParams(query);
    if (!limit || !page) {
      return results;
    }
    const { items, totalItems } = results;
    const totalPages = Math.ceil(totalItems / limit);
    return {
      items,
      totalItems,
      page,
      totalPages,
      limit,
    };
  }
  public static paginateNotification<ResultType>(
    results: PaginationResultNotification<ResultType>,
    query: PaginationInput & Record<any, any>
  ): PaginationResultNotification<ResultType> {
    const { limit, page } = this.parseTakeSkipParams(query);
    if (!limit || !page) {
      return results;
    }
    const { items, totalItems, totalUnread, systemUnread, transactionUnread } = results;
    return {
      items,
      totalItems,
      totalUnread,
      systemUnread,
      transactionUnread,
    };
  }

  public static parseTakeSkipParams(options: PaginationInput & Record<any, any>): { limit: number; page: number } {
    let { limit, page } = options;
    if (!limit || !page) {
      return {
        limit: null,
        page: null,
      };
    }
    limit = Math.min(Math.max(limit, MIN_PAGINATION_LIMIT), MAX_PAGINATION_LIMIT);
    page = Math.max(page, DEFAULT_PAGINATION_PAGE);
    return {
      limit,
      page,
    };
  }
}
