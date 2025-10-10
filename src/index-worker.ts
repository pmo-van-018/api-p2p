import 'dotenv/config';
import 'elastic-apm-node/start';

import 'reflect-metadata';
import 'module-alias/register';

import { bootstrapMicroframework } from 'microframework-w3tec';
import { eventDispatchLoader } from './loaders/eventDispatchLoader';
import { iocLoader } from './loaders/iocLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { workerLoader } from './loaders/workerLoader';
import { transactionalClsHookedLoader } from './loaders/transactionalClsHookedLoader';
import { bannerWorker } from './utils/banner';
import { Logger } from './utils/logger';
import { socketLoader } from './loaders/socketLoader';
import { bankCodeLoader } from '@base/loaders/bankCodeLoader';
import { TokenChain } from './setup-chain';
import { parseCommandLineArguments } from './parse-command-line';

const log = new Logger(__filename);

const commandLineArguments = parseCommandLineArguments();
const commandLineOptions = commandLineArguments.opts();

const tokenChain = new TokenChain({ overwriteContract: false });

tokenChain
  .loadCommandLineOptions(commandLineOptions)
  .setup()
  .then(() =>
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
      })
      .catch((error) => log.error('Application is crashed: ' + error))
  );
