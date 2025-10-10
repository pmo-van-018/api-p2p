import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { FiatRepository } from '@api/master-data/repositories/FiatRepository';

@Service()
@ValidatorConstraint({ async: true })
export class IsFiatIdValidator implements ValidatorConstraintInterface {
  constructor(@InjectRepository() private fiatRepository: FiatRepository) {}
  public validate(value: any, _args: ValidationArguments) {
    return (
      value &&
      this.fiatRepository.findOne({ id: value }).then((fiat) => {
        if (fiat) {
          return true;
        }
        return false;
      })
    );
  }

  public defaultMessage(validationArguments?: ValidationArguments): string {
    return `fiatId ${validationArguments.value} not found`;
  }
}

export function IsFiatId(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFiatIdValidator,
    });
  };
}
