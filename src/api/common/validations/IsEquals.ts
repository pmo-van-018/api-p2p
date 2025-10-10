import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsEquals(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isEquals',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === 'string' && typeof relatedValue === 'string' && value === relatedValue;
        },
        defaultMessage() {
          return `must be equals to ${property}`;
        },
      },
    });
  };
}
