import { PaginationResult, PaginationResultNotification } from '@api/common/types';
import { ServiceResult } from '../helpers/ServiceResult';
import { formatErrorResponse } from '@base/utils/response.util';

export abstract class ControllerBase {
  public response<T extends new (...args: any[]) => InstanceType<T>>(
    result: ServiceResult<any>,
    responseClass: T | T[]
  ) {
    if (!result.errors?.length) {
      if (Array.isArray(responseClass)) {
        result.data = result.data.map((value: any) => new responseClass[0](value));
        return result;
      }
      result.data = new responseClass(result.data);
    }
    return formatErrorResponse(result);
  }

  public responsePagination<T extends new (...args: any[]) => InstanceType<T>>(
    result: ServiceResult<any>,
    responseClass: T
  ) {
    if (!result.errors?.length) {
      const { totalItems } = result.data as PaginationResult<any>;
      const items = result.data.items.map((value: any) => new responseClass(value));
      result.data = {
        items,
        totalItems,
      };
    }
    return formatErrorResponse(result);
  }
  public responsePaginationNotification<T extends new (...args: any[]) => InstanceType<T>>(
    result: ServiceResult<any>,
    responseClass: T
  ) {
    if (!result.errors?.length) {
      const { totalItems, totalUnread, transactionUnread, systemUnread } =
        result.data as PaginationResultNotification<any>;
      const items = result.data.items.map((value: any) => new responseClass(value));
      result.data = {
        items,
        totalItems,
        totalUnread,
        systemUnread,
        transactionUnread,
      };
    }
    return formatErrorResponse(result);
  }
}
