import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!value || !relatedValue) {
            return true;
          }
          if (!moment(value).isValid() || !moment(relatedValue).isValid()) {
            return true;
          }
          return moment(value).isAfter(relatedValue);
        },
      },
    });
  };
}
