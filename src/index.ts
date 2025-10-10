import 'dotenv/config';
import 'elastic-apm-node/start';

import 'reflect-metadata';
import 'module-alias/register';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { eventDispatchLoader } from './loaders/eventDispatchLoader';
import { expressLoader } from './loaders/expressLoader';
import { homeLoader } from './loaders/homeLoader';
import { iocLoader } from './loaders/iocLoader';
import { swaggerLoader } from './loaders/swaggerLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { socketLoader } from './loaders/socketLoader';
import { transactionalClsHookedLoader } from './loaders/transactionalClsHookedLoader';
import { banner } from './utils/banner';
import { Logger } from './utils/logger';
import { schedulerLoader } from './loaders/schedulerLoader';
import { bankCodeLoader } from './loaders/bankCodeLoader';
import { TokenChain } from './setup-chain';
import { parseCommandLineArguments } from './parse-command-line';

const log = new Logger(__filename);

const commandLineArguments = parseCommandLineArguments();
const commandLineOptions = commandLineArguments.opts();

const tokenChain = new TokenChain({ overwriteContract: true });

tokenChain
  .loadCommandLineOptions(commandLineOptions)
  .setup()
  .then(() =>
    bootstrapMicroframework({
      /**
       * APP MODULES
       */
      loaders: [
        transactionalClsHookedLoader,
        winstonLoader,
        iocLoader,
        eventDispatchLoader,
        typeormLoader,
        expressLoader,
        swaggerLoader,
        homeLoader,
        socketLoader,
        schedulerLoader,
        bankCodeLoader,
      ],
    })
      .then((framework) => {
        banner(log);
        const graceful = () => {
          Promise.all([framework.shutdown()]).then(() => process.exit(0));
        };
        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);
      })
      .catch((error) => log.error('Application is crashed: ' + error))
  );
