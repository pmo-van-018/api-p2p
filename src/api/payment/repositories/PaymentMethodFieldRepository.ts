import { EntityRepository } from 'typeorm';
import { PaymentMethodField } from '@api/payment/models/PaymentMethodField';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';

@EntityRepository(PaymentMethodField)
export class PaymentMethodFieldRepository extends RepositoryBase<PaymentMethodField> {}
