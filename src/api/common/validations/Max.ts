import { Max, registerDecorator, ValidationOptions } from 'class-validator';

import { MAX_CRYPTO, MAX_FEE, MAX_FIAT } from '@api/common/models/P2PConstant';
import BigNumber from 'bignumber.js';

export function MaxFiat(validationOptions?: ValidationOptions): PropertyDecorator {
  return Max(MAX_FIAT, validationOptions);
}

export function MaxCrypto(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'MaxCrypto',
      target: object.constructor,
      propertyName,
      options: {
        ...validationOptions,
      },
      validator: {
        validate(value: number | string) {
          return new BigNumber(value).isLessThanOrEqualTo(MAX_CRYPTO);
        },
      },
    });
  };
}

export function MaxFee(validationOptions?: ValidationOptions): PropertyDecorator {
  return Max(MAX_FEE, validationOptions);
}
