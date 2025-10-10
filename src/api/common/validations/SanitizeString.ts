import { PostError } from '@api/post/errors/PostError';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function SanitizeString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'sanitizeString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return !(
              /<([^>]+)>|"([^"]+)"/g.test(value)
            );
          }
          return false;
        },
        defaultMessage() {
          return PostError.NOTE_IS_INVALID.key;
        },
      },
    });
  };
}