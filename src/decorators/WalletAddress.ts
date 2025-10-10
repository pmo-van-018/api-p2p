import { registerDecorator, ValidationOptions } from 'class-validator';
import { ethers } from 'ethers';
import { UserError } from '@api/profile/errors/UserError';
import { isTronWalletAddress } from '@api/order/services/TronService';

export function IsWalletAddress(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsWalletAddress',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (ethers.utils.isAddress(value)) {
            return true;
          }
          return isTronWalletAddress(value);
        },
        defaultMessage() {
          return UserError.WALLET_ADDRESS_INVALID.key;
        },
      },
    });
  };
}
