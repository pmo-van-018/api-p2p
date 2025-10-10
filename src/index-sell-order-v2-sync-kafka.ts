import 'dotenv/config';

import 'module-alias/register';
import 'reflect-metadata';

import { SellOrderV2DataSyncService } from '@api/sync/services/SellOrderV2DataSyncService';
import { bootstrapMicroframework } from 'microframework-w3tec';
import Container from 'typedi';
import { iocLoader } from './loaders/iocLoader';
import { transactionalClsHookedLoader } from './loaders/transactionalClsHookedLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { Logger } from './utils/logger';

const log = new Logger(__filename);

bootstrapMicroframework({
  loaders: [transactionalClsHookedLoader, winstonLoader, iocLoader, typeormLoader],
})
  .then(async () => {
    const kafkaDataSyncService = Container.get(SellOrderV2DataSyncService);
    await kafkaDataSyncService.sync();
  })
  .catch((error) => log.error('Application is crashed: ' + error))
  .then(() => process.exit(0));
