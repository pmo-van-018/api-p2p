import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { CryptoTransactionStatus } from '@api/order/models/CryptoTransactionStatus';
import { EntityRepository } from 'typeorm';

@EntityRepository(CryptoTransactionStatus)
export class CryptoTransactionStatusRepository extends RepositoryBase<CryptoTransactionStatus> {}
