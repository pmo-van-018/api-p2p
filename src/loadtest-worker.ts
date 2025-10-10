import 'dotenv/config';
import 'elastic-apm-node/start';

import 'module-alias/register';
import 'reflect-metadata';

import CryptoTransactionWorker from '@api/workers/CryptoTransactionWorker';
import { bankCodeLoader } from '@base/loaders/bankCodeLoader';
import { bootstrapMicroframework } from 'microframework-w3tec';
import Container from 'typedi';
import { eventDispatchLoader } from './loaders/eventDispatchLoader';
import { iocLoader } from './loaders/iocLoader';
import { socketLoader } from './loaders/socketLoader';
import { transactionalClsHookedLoader } from './loaders/transactionalClsHookedLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { workerLoader } from './loaders/workerLoader';
import { bannerWorker } from './utils/banner';
import { Logger } from './utils/logger';
import _ from 'lodash';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { Order } from '@api/order/models/Order';
import { User } from '@api/profile/models/User';
import { Asset } from '@api/master-data/models/Asset';
import { BLOCKCHAIN_NETWORKS } from '@api/common/models';
import { getOsEnvOptional } from './utils/env/utils';

const log = new Logger(__filename);

bootstrapMicroframework({
  loaders: [
    transactionalClsHookedLoader,
    winstonLoader,
    iocLoader,
    typeormLoader,
    eventDispatchLoader,
    socketLoader,
    workerLoader,
    bankCodeLoader,
  ],
})
  .then((framework) => {
    bannerWorker(log);
    const graceful = () => {
      Promise.all([framework.shutdown()]).then(() => process.exit(0));
    };
    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);

    const worker = Container.get<CryptoTransactionWorker>(CryptoTransactionWorker);
    _.range(0, +getOsEnvOptional('WORKER_TEST_TRANS') ?? 200).forEach(idx => {
      const tranx = new CryptoTransaction();
      tranx.id = '146c9b0f-95ae-476d-9766-efa3b1e2264d' + idx;
      tranx.orderId = '91514b74-71c5-4023-99fa-0c370af178c7';
      tranx.status = TransactionStatus.PENDING;
      tranx.hash = [
        '0x46a08ee6e470fad4d5a4a44698e9ce9046d470f466d30c1a35f3cf4fc7a9001c'
        ][Math.floor(Math.random() * 1)];
      tranx.order = new Order();
      tranx.order.id = '91514b74-71c5-4023-99fa-0c370af178c7';
      tranx.order.user = new User();
      tranx.order.user.walletAddress = '0xe1677409be3418fe1b4519a8ed085c2378e50823';
      tranx.order.asset = new Asset();
      tranx.order.asset.network = BLOCKCHAIN_NETWORKS.POLYGON;
      worker.transactionProcessMap.set(tranx.id, tranx);
    })
      
  })
  .catch((error) => log.error('Application is crashed: ' + error));
