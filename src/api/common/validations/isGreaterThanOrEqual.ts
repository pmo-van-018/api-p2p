import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsGreaterThanOrEqual(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isGreaterThanOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === 'number' && typeof relatedValue === 'number' && value >= relatedValue;
        },
      },
    });
  };
}
