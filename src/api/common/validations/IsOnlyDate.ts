import { registerDecorator, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsOnlyDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isOnlyDate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Please provide only date like 2022-12-08',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return (
              /^[1-9]\d*-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && moment(value, 'YYYY-MM-DD').isValid()
            );
          }
          return false;
        },
      },
    });
  };
}
