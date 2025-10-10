import { Propagation } from 'typeorm-transactional-cls-hooked/dist/Propagation';
import { IsolationLevel } from 'typeorm-transactional-cls-hooked/dist/IsolationLevel';

export const TRANSACTION_DEFAULT_OPTIONS = {
  propagation: Propagation.REQUIRED,
  isolationLevel: IsolationLevel.READ_COMMITTED,
};
