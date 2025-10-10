import { EntityRepository, Repository } from 'typeorm';

import { Fiat } from '@api/master-data/models/Fiat';

@EntityRepository(Fiat)
export class FiatRepository extends Repository<Fiat> {}
