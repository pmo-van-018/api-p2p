import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { OrderStatus } from '@api/order/models/Order';

@EntityRepository(CryptoTransaction)
export class CryptoTransactionRepository extends RepositoryBase<CryptoTransaction> {
  public async getPendingTransactions(query?: { lessThanDate?: Date }): Promise<CryptoTransaction[]> {
    const qb = this.createQueryBuilder('cryptoTransaction')
      .leftJoinAndSelect('cryptoTransaction.order', 'order')
      .leftJoinAndSelect('order.asset', 'asset')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.merchant', 'merchant')
      .leftJoinAndSelect('cryptoTransaction.cryptoTransactionStatus', 'cryptoTransactionStatus')
      .where('cryptoTransaction.status = :status', { status: TransactionStatus.PENDING })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.TO_BE_PAID, OrderStatus.CONFIRM_PAID, OrderStatus.PAID],
      });

    if (query.lessThanDate) {
      qb.andWhere('cryptoTransaction.updatedAt <= :lessThanDate', { lessThanDate: query.lessThanDate });
    }

    return qb.getMany();
  }
}
