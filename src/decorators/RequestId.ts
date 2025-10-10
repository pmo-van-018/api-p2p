import { createParamDecorator } from 'routing-controllers';

export function RequestId(options?: { required?: boolean }): any {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: (action) => action.request['id'],
  });
}
