import { registerDecorator, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment from 'moment';
import { DateError } from '../errors/DateError';

@ValidatorConstraint({ name: 'isPastDate', async: false })
export class IsPastDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    const currentStartDate = moment().utc().startOf('day').toDate();
    return moment(date).isBefore(currentStartDate);
  }
  defaultMessage(): string {
    return DateError.DATE_MUST_IN_THE_PAST.key;
  }
}

export function IsPastDate() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPastDate',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        context: DateError.DATE_MUST_IN_THE_PAST,
      },
      validator: {
        validate(date: Date) {
          const currentStartDate = moment().utc().startOf('day').toDate();
          return moment(date, "YYYY-MM-DD HH:mm:ss").isBefore(currentStartDate);
        },
        defaultMessage(): string {
          return DateError.DATE_MUST_IN_THE_PAST.key;
        }
      },
    });
  };
}
