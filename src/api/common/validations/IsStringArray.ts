import { isString, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const DEFAULT_SEPARATOR = ',';

/**
 * Verify the list values through string with separator.
 * Default separator: ','.
 *
 * @example
 *
 * ```ts
 * `@IsStringArray([1,2])`
 * public status?: string;
 *
 * const status = '1' -> accept
 * const status = '1,2' -> accept
 * const status = '5' -> decline
 * const status = '1,5' -> decline
 * const status = 1 -> decline (1 is number)
 * ```
 */
export function IsStringArray(
  property: unknown[],
  validationOptions?: ValidationOptions & { separator?: string | RegExp }
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isStringArray',
      target: object.constructor,
      propertyName,
      constraints: property,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!isString(value)) {
            return false;
          }
          const separator = validationOptions?.separator ?? DEFAULT_SEPARATOR;
          return value.split(separator).every((v: any) => {
            for (const constraint of args.constraints) {
              v = typeof constraint === 'number' ? Number(v) : typeof constraint === 'string' ? v.toString() : v;
              if (constraint === v) {
                return true;
              }
            }
            return false;
          });
        },
        defaultMessage(validationArguments?: ValidationArguments) {
          return `'${
            validationArguments.property
          }' must be one of the following values: '${validationArguments.constraints.toString()}'`;
        },
      },
    });
  };
}
