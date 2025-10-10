/**
 * Windows: Please do not use trailing comma as windows will fail with token error
 */

const { series, concurrent, rimraf } = require('nps-utils');

module.exports = {
  scripts: {
    default: 'nps start',
    /**
     * Starts the builded app from the dist directory.
     */
    start: {
      api: {
        script: series(
          'nps build',
          'nps banner.api',
          'cross-env NODE_ENV=production node --max-semi-space-size=128 dist/index.js'
        ),
        description: 'Starts the api',
      },
      worker: {
        script: series(
          'nps build',
          'nps script.statistic',
          'nps banner.worker',
          'cross-env NODE_ENV=production node --max-semi-space-size=128 dist/index-worker.js'
        ),
        description: 'Starts the worker',
      },
    },
    /**
     * Serves the current app and watches for changes to restart it
     */
    serve: {
      api: {
        script: series(
          'nps banner.api',
          'cross-env NODE_ENV=development nodemon --watch src --watch .env --max-semi-space-size=128 src/index.ts'
        ),
        description: 'Serves the current api and watches for changes to restart it',
      },
      worker: {
        script: series(
          'nps banner.worker',
          'nps script.statistic',
          'cross-env NODE_ENV=development nodemon --watch src --watch .env --max-semi-space-size=128 src/index-worker.ts'
        ),
        description: 'Serves the current worker and watches for changes to restart it',
      },
      sync: {
        script: series(runFast('./src/index-sell-order-v2-sync-kafka.ts')),
        description: 'Serves the current worker and watches for changes to restart it',
      },
      backfill: {
        script: series(runFast('./src/index-order-backfill.ts')),
        description: 'Serves the current worker and watches for changes to restart it',
      },
    },
    stressTestWorker: {
      script: series(
        'nps banner.worker',
        'nodemon --watch src --watch .env --max-semi-space-size=128 src/loadtest-worker.ts'
      ),
      description: 'Serves the current worker and watches for changes to restart it',
    },
    /**
     * Setup of the development environment
     */
    setup: {
      script: series('yarn install', 'nps db.setup'),
      description: 'Setup`s the development environment(yarn & database)',
    },
    /**
     * Creates the needed configuration files
     */
    config: {
      script: series(runFast('./commands/tsconfig.ts')),
      hiddenFromHelp: true,
    },
    /**
     * Builds the app into the dist directory
     */
    build: {
      script: series(
        'nps banner.build',
        'nps config',
        'nps lint',
        'nps clean.dist',
        'nps transpile',
        'nps copy',
        'nps copy.tmp',
        'nps clean.tmp'
      ),
      description: 'Builds the app into the dist directory',
    },
    /**
     * Runs TSLint over your project
     */
    lint: {
      script: tslint(`./src/**/*.ts`),
      hiddenFromHelp: true,
    },
    /**
     * Transpile your app into javascript
     */
    transpile: {
      script: `tsc --project ./tsconfig.build.json && tsc-alias -p tsconfig.build.json`,
      hiddenFromHelp: true,
    },
    /**
     * Clean files and folders
     */
    clean: {
      default: {
        script: series(`nps banner.clean`, `nps clean.dist`),
        description: 'Deletes the ./dist folder',
      },
      dist: {
        script: rimraf('./dist'),
        hiddenFromHelp: true,
      },
      tmp: {
        script: rimraf('./.tmp'),
        hiddenFromHelp: true,
      },
      migrate: {
        script: rimraf('./src/database/migrations/*'),
        hiddenFromHelp: true,
      },
    },
    /**
     * Copies static files to the build folder
     */
    copy: {
      default: {
        script: series(`nps copy.public`),
        hiddenFromHelp: true,
      },
      public: {
        script: copy('./src/public/*', './dist'),
        hiddenFromHelp: true,
      },
      tmp: {
        script: copyDir('./.tmp/src', './dist'),
        hiddenFromHelp: true,
      },
    },
    /**
     * Database scripts
     */
    db: {
      migrate: {
        script: series('nps banner.migrate', 'nps config', runFast('./node_modules/typeorm/cli.js migration:run')),
        description: 'Migrates the database to newest version available',
      },
      test_mi: {
        script: series(
          'nps banner.migrate',
          'nps config',
          rimraf('./test/database/migrations/*'),
          runFast('./node_modules/typeorm/cli.js migration:generate -n InitialDatabaseTest')
        ),
        description: 'Migrates the database to newest version available',
      },
      revert: {
        script: series('nps banner.revert', 'nps config', runFast('./node_modules/typeorm/cli.js migration:revert')),
        description: 'Downgrades the database',
      },
      seed: {
        script: series('nps banner.seed', 'nps config', runFast('./node_modules/typeorm-seeding/dist/cli.js seed')),
        description: 'Seeds generated records into the database',
      },
      drop: {
        script: runFast('./node_modules/typeorm/cli.js schema:drop'),
        description: 'Drops the schema of the database',
      },
      drop_mi: {
        script: series('nps clean.migrate', runFast('./node_modules/typeorm/cli.js schema:drop')),
        description: 'Drops the schema of the database',
      },
      setup: {
        script: series('nps db.drop', 'nps db.migrate', 'nps db.seed'),
        description: 'Recreates the database with seeded data',
      },
    },
    /**
     * common scripts
     */
    script: {
      statistic: {
        script: series('nps banner.statistic', 'node ./scripts/statistic'),
        description: 'Script to sum user and operator statistics',
      },
      volume: {
        script: series('nps banner.volume', 'node ./scripts/volume'),
        description: 'Script to set user and operator volumes',
      },
      peerChatId: {
        script: series('nps banner.peerChatId', 'node ./scripts/peerChatId'),
        description: 'Script to set peer chat id of users and operations',
      },
      referralCode: {
        script: series('nps banner.referralCode', 'node ./scripts/referralCode'),
        description: 'Script to generate referral code',
      },
      managerNickname: {
        script: series('nps banner.managerNickname', 'node ./scripts/managerNickname'),
        description: 'Script to replace nick name if duplicate',
      },
      managerWallet: {
        script: series('nps banner.managerWallet', 'node ./scripts/managerWallet'),
        description: 'Script to migrate wallet addresses',
      },
      removeDataK6: {
        script: series('nps banner.removeDataK6', 'node ./scripts/removeDataK6'),
        description: 'Script to remove data for k6 test',
      },
      avgOrderTime: {
        script: series('nps banner.avgOrderTime', 'node ./scripts/avgOrderTime'),
        description: 'Script to calculate average order time',
      },
      resetPassword: {
        script: series('nps banner.resetPassword', 'node ./scripts/resetPassword'),
        description: 'Script to reset reporter password.',
      },
      backfillOrdersToOutBox: {
        script: series('nps banner.backfillOrdersToOutBox', 'node ./scripts/backfillOrdersToOutBox'),
        description: 'Script to backfill orders to outbox',
      },
    },
    /**
     * These run various kinds of tests. Default is unit.
     */
    test: {
      default: 'nps test.unit',
      unit: {
        default: {
          script: series('nps banner.testUnit', 'nps test.unit.pretest', 'nps test.unit.run'),
          description: 'Runs the unit tests',
        },
        pretest: {
          script: tslint(`./test/unit/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          script: 'cross-env NODE_ENV=test jest --testPathPattern=unit',
          hiddenFromHelp: true,
        },
        verbose: {
          script: 'nps "test --verbose"',
          hiddenFromHelp: true,
        },
        coverage: {
          script: 'nps "test --coverage"',
          hiddenFromHelp: true,
        },
      },
      integration: {
        default: {
          script: series('nps banner.testIntegration', 'nps test.integration.pretest', 'nps test.integration.run'),
          description: 'Runs the integration tests',
        },
        pretest: {
          script: tslint(`./test/integration/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: 'cross-env NODE_ENV=test jest --testPathPattern=integration -i',
          hiddenFromHelp: true,
        },
        verbose: {
          script: 'nps "test --verbose"',
          hiddenFromHelp: true,
        },
        coverage: {
          script: 'nps "test --coverage"',
          hiddenFromHelp: true,
        },
      },
      e2e: {
        default: {
          script: series('nps banner.testE2E', 'nps test.e2e.pretest', 'nps test.e2e.run'),
          description: 'Runs the e2e tests',
        },
        pretest: {
          script: tslint(`./test/e2e/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: 'cross-env NODE_ENV=test jest --testPathPattern=e2e -i',
          hiddenFromHelp: true,
        },
        verbose: {
          script: 'nps "test --verbose"',
          hiddenFromHelp: true,
        },
        coverage: {
          script: 'nps "test --coverage"',
          hiddenFromHelp: true,
        },
      },
    },
    /**
     * This creates pretty banner to the terminal
     */
    banner: {
      build: banner('build'),
      api: banner('api'),
      worker: banner('worker'),
      testUnit: banner('test.unit'),
      testIntegration: banner('test.integration'),
      testE2E: banner('test.e2e'),
      migrate: banner('migrate'),
      generate: banner('generate'),
      seed: banner('seed'),
      revert: banner('revert'),
      clean: banner('clean'),
      statistic: banner('script.statistic'),
      volume: banner('script.volume'),
      peerChatId: banner('script.peerChatId'),
      referralCode: banner('script.referralCode'),
      fixStatisticCount: banner('script.fixStatisticCount'),
      managerNickname: banner('script.managerNickname'),
      managerWallet: banner('script.managerWallet'),
      removeDataK6: banner('script.removeDataK6'),
      avgOrderTime: banner('script.avgOrderTime'),
      resetPassword: banner('script.resetPassword'),
      backfillOrdersToOutBox: banner('script.backfillOrdersToOutBox'),
    },
    format: {
      script: 'prettier --write "src/**/*.ts"',
      hiddenFromHelp: true,
    },
  },
};

function banner(name) {
  return {
    hiddenFromHelp: true,
    silent: true,
    description: `Shows ${name} banners to the console`,
    script: runFast(`./commands/banner.ts ${name}`),
  };
}

function copy(source, target) {
  return `copyfiles --up 1 ${source} ${target}`;
}

function copyDir(source, target) {
  return `ncp ${source} ${target}`;
}

function run(path) {
  return `ts-node ${path}`;
}

function runFast(path) {
  return `ts-node -r ./fix-module-alias.js --transpileOnly ${path}`;
}

function tslint(path) {
  return `tslint -c ./tslint.json ${path} --format stylish`;
}
