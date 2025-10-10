import { UserError } from '@api/profile/errors/UserError';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNickNameValid(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsNickNameValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return /^[a-zA-Z0-9_-]+$/.test(value)
        },
        defaultMessage() {
          return UserError.NICKNAME_INVALID.key;
        },
      },
    });
  };
}
