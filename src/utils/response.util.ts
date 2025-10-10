import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';

export function formatErrorResponse(result: ServiceResult<any>) {
  return {
    data: result.data || null,
    errors: result.errors ? result.errors.map(e => ({
      key: e.key,
      message: e.message,
      field: e.property,
    })) : null,
  };
}

export function isResponseSuccess(response: any) {
  return response.data?.status === 1 && response.data?.code === 200;
}
