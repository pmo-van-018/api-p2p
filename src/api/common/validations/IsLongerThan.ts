import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsLongerThan(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length;
        },
        defaultMessage(validationArguments?: ValidationArguments) {
          return '';
        },
      },
    });
  };
}
