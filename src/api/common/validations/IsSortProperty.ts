import { SortOrder } from '@api/common/types';
import { isString, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const DEFAULT_COLUMN_SEPARATOR = ',';

const DEFAULT_PROPERTY_DIRECTION_SEPARATOR = ':';

/**
 * Verify the list values to sort through string with separator.
 * Default column separator: ','.
 * Default property direction separator: ':'.
 *
 * @example
 *
 * ```ts
 * `@IsSortProperty(['updatedAt', 'endedTime'])`
 * public status?: string;
 *
 * const status = 'updatedAt' -> accept
 * const status = 'updatedAt:DESC' -> accept
 * const status = 'updatedAt,endedTime:ASC' -> accept
 * const status = 'id' -> decline ('id' is not whitelisted)
 * const status = 'updatedAt:other' -> decline ('other' is not a valid order)
 * ```
 */
export function IsSortProperty(
  properties: string[],
  validationOptions?: ValidationOptions & { separator?: string | RegExp }
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isStringArray',
      target: object.constructor,
      propertyName,
      constraints: properties,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!isString(value)) {
            return false;
          }
          const separator = validationOptions?.separator ?? DEFAULT_COLUMN_SEPARATOR;
          return value.split(separator).every((v: any) => {
            const [property, direction] = v.split(DEFAULT_PROPERTY_DIRECTION_SEPARATOR) as [string, SortOrder];
            if (!args.constraints.includes(property)) {
              return false;
            }
            if (direction && direction.toUpperCase() !== 'ASC' && direction.toUpperCase() !== 'DESC') {
              return false;
            }
            return true;
          });
        },
        defaultMessage(validationArguments?: ValidationArguments) {
          return `Please provide text string like '{property}${DEFAULT_PROPERTY_DIRECTION_SEPARATOR}{order}',
  {property} must be one the following value: '${validationArguments.constraints.toString()}',
  {order} must be one of the following value: 'asc' | 'desc' | 'ASC' | 'DESC'. You can sort by multiple columns by using separator '${DEFAULT_COLUMN_SEPARATOR}'.`;
        },
      },
    });
  };
}
