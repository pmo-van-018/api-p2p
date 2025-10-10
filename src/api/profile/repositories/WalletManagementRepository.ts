import { EntityRepository } from 'typeorm';
import { WalletAddressManagement } from '@api/profile/models/WalletAddressManagement';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';

@EntityRepository(WalletAddressManagement)
export class WalletAddressManagementRepository extends RepositoryBase<WalletAddressManagement> {}
