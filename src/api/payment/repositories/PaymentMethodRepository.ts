import { EntityRepository } from 'typeorm';

import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Operation } from '@api/profile/models/Operation';
import { PostStatus } from '@api/common/models';
import { PaymentMethodOwner } from '@api/payment/types/PaymentMethod';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@EntityRepository(PaymentMethod)
export class PaymentMethodRepository extends BaseRepository<PaymentMethod> {

  public getUserPaymentMethods(userId: string, pagination?: PaginationQueryRequest) {
    const queryBuilder = this.buildQuery()
      .where('paymentMethod.user_id = :userId', { userId })
      .orderBy('paymentMethod.createdAt', 'ASC');
    if (pagination) {
      queryBuilder
        .skip(pagination.limit * (pagination.page - 1))
        .take(pagination.limit);
    }
    return queryBuilder.getManyAndCount();
  }

  public getOperationPaymentMethods(operationId: string, pagination?: PaginationQueryRequest) {
    const queryBuilder = this.buildQuery()
      .where('paymentMethod.operation_id = :operationId', { operationId })
      .orderBy('paymentMethod.createdAt', 'ASC');
    if (pagination) {
      queryBuilder
        .skip(pagination.limit * (pagination.page - 1))
        .take(pagination.limit);
    }
    return queryBuilder.getManyAndCount();
  }

  public getDuplicatedBankNumber(owner: PaymentMethodOwner, bankNumber: string) {
    const ownerWhereCondition = `paymentMethod.${ owner.operationId ? 'operation_id' : 'user_id' } = '${ owner.operationId || owner.userId }'`;
    return this.buildQuery()
      .where(ownerWhereCondition)
      .andWhere('paymentMethodFields.value = :bankNumber', { bankNumber })
      .andWhere('paymentMethodFields.contentType = :contentType', {
        contentType: CONTENT_TYPE_BANK.BANK_NUMBER,
      })
      .getMany();
  }

  public getOperationPaymentMethodById(operationId: string, id: string) {
    return this.buildQuery()
      .where('paymentMethod.id = :id', { id })
      .andWhere('paymentMethod.operation_id = :operationId', { operationId })
      .leftJoinAndSelect('paymentMethod.posts', 'posts', `posts.status = '${PostStatus.ONLINE}'`)
      .leftJoinAndSelect('posts.orders', 'orders', `orders.paymentMethodId = '${ id }'`)
      .getOne();
  }

  public getPostsByOperationAndPaymentMethodId(merchant: Operation, paymentMethodId: string) {
    const operationId = merchant.id;
    const queryBuilder = this.buildQuery();
    queryBuilder.leftJoinAndSelect('paymentMethod.posts', 'posts');
    queryBuilder
      .andWhere('paymentMethod.operationId = :operationId', { operationId })
      .andWhere('paymentMethod.id = :id', { id: paymentMethodId });

    return queryBuilder.getOne();
  }

  public getPaymentMethodListWithBankName(bankNameList: string[]): Promise<PaymentMethod[]> {
    const queryBuilder = this.buildQuery();
    return queryBuilder
      .leftJoinAndSelect('paymentMethod.operation', 'operation')
      .leftJoinAndSelect('paymentMethod.user', 'user')
      .andWhere('paymentMethodFields.contentType = :contentType', {
        contentType: CONTENT_TYPE_BANK.BANK_NAME,
      })
      .andWhere('paymentMethodFields.value IN (:value)', {
        value: bankNameList,
      })
      .getMany();
  }

  public async getPaymentMethodById(id: string) {
    return this.buildQuery()
      .where('paymentMethod.id = :id', { id })
      .getOne();
  }
  
  public async getPaymentMethodByIds(ids: string[]) {
    return this.buildQuery()
      .where('paymentMethod.id IN (:ids)', { ids })
      .getMany();
  }

  private buildQuery() {
    return this.createQueryBuilder('paymentMethod').innerJoinAndSelect(
      'paymentMethod.paymentMethodFields',
      'paymentMethodFields'
    );
  }
}
