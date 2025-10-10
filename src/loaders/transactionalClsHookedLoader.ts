import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

export const transactionalClsHookedLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
};
