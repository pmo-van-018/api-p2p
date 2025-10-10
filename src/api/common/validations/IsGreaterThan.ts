import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
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
          return (
            !(relatedValue && value) ||
            (typeof value === 'number' && typeof relatedValue === 'number' && value > relatedValue)
          );
        },
      },
    });
  };
}
