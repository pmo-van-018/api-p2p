import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsBeforeDate(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isBeforeDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          const isBeforeDate = moment(value).isBefore(relatedValue);
          const isEqual = value === relatedValue;
          if (!value || !relatedValue) {
            return true;
          }
          return typeof value === 'string' && typeof relatedValue === 'string' && (isBeforeDate || isEqual);
        },
      },
    });
  };
}
