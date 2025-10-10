import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { AssetRepository } from '@api/master-data/repositories/AssetRepository';

@Service()
@ValidatorConstraint({ async: true })
export class IsAssetIdValidator implements ValidatorConstraintInterface {
  constructor(@InjectRepository() private assetRepository: AssetRepository) {}
  public validate(value: any, _args: ValidationArguments) {
    return (
      value &&
      this.assetRepository.findOne({ id: value }).then((asset) => {
        return !!asset;
      })
    );
  }

  public defaultMessage(validationArguments?: ValidationArguments): string {
    return `assetId ${validationArguments.value} not found`;
  }
}

export function IsAssetId(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAssetIdValidator,
    });
  };
}
