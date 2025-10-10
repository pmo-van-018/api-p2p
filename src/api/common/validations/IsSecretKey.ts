import { validateSecretCode } from '@base/utils/helper.utils';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsSecretKey(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsSecretKey',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [prefix] = args.constraints;
          return value ? validateSecretCode(value, prefix) : true;
        },
        defaultMessage(validationArguments?: ValidationArguments) {
          return `'${
            validationArguments.property
          }' must be following values: '${validationArguments.constraints.toString()}'`;
        },
      },
    });
  };
}
