import { Request } from 'express';
import { UseInterceptor, Action, InterceptorInterface } from 'routing-controllers';
import { ApiResponseHandler } from '@api/infrastructure/abstracts/ApiResponseHandler';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { env } from '@base/env';
import { Logger } from '@base/utils/logger';
import { PaginationInput } from '@api/common/types';
import { PaginationUtil } from '@base/utils/pagination.util';
import { isErrorInfo } from '@base/utils/helper.utils';
import { HttpResponseError } from '@api/common/errors';
import { P2PError } from '@api/common/errors/P2PError';

const logger = new Logger(__filename);

export const responseHandler = new ApiResponseHandler();

/**
 * Wrap and execute route handler.
 *
 * @example
 * ```ts
 * `@Response(MerchantManagerInfoResponse)`
 * public async findOne() {
 *   return await this.findOne();
 * }
 * ```
 */
export function Response<T extends new (...args: any[]) => InstanceType<T>>(
  responseClass: T | T[]
) {
  return (_target: any, _nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await handleCallMethodResult.call(this, originalMethod, ...args);
      return responseHandler.response(result, responseClass);
    };
  };
}

/**
 * Wrap and execute route handler and pagination.
 *
 * @example
 * ```ts
 * `@PaginationResponse(MerchantManagerInfoResponse)`
 * public async findAll() {
 *   return await this.findAll();
 * }
 * ```
 */
export function PaginationResponse<T extends new (...args: any[]) => InstanceType<T>>(
  responseClass: T
) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await handleCallMethodResult.call(this, originalMethod, ...args);
      return responseHandler.responsePagination(result, responseClass);
    };
    // pagination
    UseInterceptor(
      class PaginationInterceptor implements InterceptorInterface {
        public intercept(action: Action, content: ServiceResult<any>): ServiceResult<any> {
          if (content.errors) {
            return content;
          }
          const request = action.request as Request;
          const { limit, page } = request.query as PaginationInput;
          const data = PaginationUtil.paginate(content.data, { limit, page });
          return {
            data,
            errors: null,
          };
        }
      }
    )(target, methodName);
  };
}

export function PaginationNotificationResponse<T extends new (...args: any[]) => InstanceType<T>>(responseClass: T) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    // route handler
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await handleCallMethodResult.call(this, originalMethod, ...args);
      return responseHandler.responsePaginationNotification(result, responseClass);
    };
    // pagination
    UseInterceptor(
      class PaginationInterceptor implements InterceptorInterface {
        public intercept(action: Action, content: ServiceResult<any>): ServiceResult<any> {
          if (content.errors) {
            return content;
          }
          const request = action.request as Request;
          const { limit, page } = request.query as PaginationInput;
          const data = PaginationUtil.paginateNotification(content.data, { limit, page });
          return {
            data,
            errors: null,
          };
        }
      }
    )(target, methodName);
  };
}

async function handleCallMethodResult(this: any, originalMethod: any, ...args: any[]) {
  let result: ServiceResult<any>;
  try {
    result = await originalMethod.apply(this, args);
    if (result && isErrorInfo(result)) {
      return ServiceResult.fail(result);
    }
    return ServiceResult.success(result);
  } catch (error: any) {
    if (env.isProduction) {
      logger.error(error.message ?? error, error.message);
    } else {
      logger.error(error.message ?? error, error.stack);
    }
    // TODO: cover api v1 (need remove when migrate to v2 completed)
    if (error instanceof P2PError) {
      throw error;
    }
    return ServiceResult.fail(HttpResponseError.INTERNAL_ERROR);
  }
}
