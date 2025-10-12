import { CHAIN, CHAIN_ID } from '@api/constant/chain';
import * as dotenv from 'dotenv';
import * as path from 'path';

import moment from 'moment';
import * as pkg from '../package.json';
import {
  getChainEnv,
  getOsEnv,
  getOsEnvArray,
  getOsEnvOptional,
  getOsPath,
  getOsPaths,
  getPaths,
  normalizePort,
  toBool,
  toNumber,
} from './utils/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
  path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`),
});

const CONTROLLERS = 'src/api/**/controllers/**/*Controller.ts';
const MIDDLEWARES = 'src/api/middlewares/**/*Middleware.ts';
const SUBSCRIBERS = 'src/api/subscribers/**/*Subscriber.ts';
const WORKERS = 'src/api/workers/**/*Worker.ts';
const JOBS = 'src/api/**/schedulers/*Job.ts';

/**
 * Environment variables
 */

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  chainEnv: getChainEnv(),
  app: {
    name: getOsEnv('APP_NAME') || 'server',
    version: (pkg as any).version,
    description: (pkg as any).description,
    host: getOsEnv('APP_HOST'),
    schema: getOsEnv('APP_SCHEMA'),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    banner: toBool(getOsEnv('APP_BANNER')),
    domain: getOsEnv('APP_DOMAIN'),
    sessionSecret: getOsEnv('APP_SESSION_SECRET'),
    sessionDomain: getOsEnv('APP_SESSION_DOMAIN'),
    userSessionExpire: getOsEnv('USER_APP_SESSION_EXPIRE'),
    operationSessionExpire: getOsEnv('OPERATION_APP_SESSION_EXPIRE'),
    adminSessionExpire: getOsEnv('ADMIN_APP_SESSION_EXPIRE'),
    sessionNonceExpire: getOsEnv('APP_SESSION_NONCE_EXPIRE'),
    hstsMaxAge: Number(getOsEnv('APP_HSTS_MAX_AGE')),
    xApiKey: getOsEnv('X_API_KEY'),
    timeZone: getOsEnv('TIME_ZONE'),
    cacheEnv: getOsEnvOptional('CACHE_ENV'),
    dirs: {
      migrations: getOsPaths('TYPEORM_MIGRATIONS'),
      migrationsDir: getOsPath('TYPEORM_MIGRATIONS_DIR'),
      entities: getOsPaths('TYPEORM_ENTITIES'),
      entitiesDir: getOsPath('TYPEORM_ENTITIES_DIR'),
      controllers: getPaths([CONTROLLERS]),
      middlewares: getPaths([MIDDLEWARES]),
      subscribers: getPaths([SUBSCRIBERS]),
      workers: getPaths([WORKERS]),
      jobs: getPaths([JOBS]),
    },
  },
  express: {
    adapter: getOsEnv('EXPRESS_ADAPTER'),
  },
  redis: {
    host: getOsEnv('REDIS_HOST'),
    port: Number(getOsEnv('REDIS_PORT')),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT'),
    maxFiles: getOsEnv('LOG_MAX_FILES') || '3d', // Limit log file to 3 days
    writeLogsToFile: toBool(getOsEnvOptional('WRITE_LOGS_TO_FILE')),
  },
  db: {
    type: getOsEnv('TYPEORM_CONNECTION'),
    host: getOsEnvOptional('TYPEORM_HOST'),
    port: toNumber(getOsEnvOptional('TYPEORM_PORT')),
    username: getOsEnvOptional('TYPEORM_USERNAME'),
    password: getOsEnvOptional('TYPEORM_PASSWORD'),
    database: getOsEnv('TYPEORM_DATABASE'),
    synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
    logging: getOsEnvArray('TYPEORM_LOGGING'),
  },
  swagger: {
    enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
    route: getOsEnv('SWAGGER_ROUTE'),
    file: getOsEnv('SWAGGER_FILE'),
    username: getOsEnv('SWAGGER_USERNAME'),
    password: getOsEnv('SWAGGER_PASSWORD'),
  },
  order: {
    userSendingFiatLimit: getOsEnv('USER_SENDING_FIAT_LIMIT'),
    userSentFiatLimit: getOsEnv('USER_SENT_FIAT_LIMIT'),
    userConfirmingFiatLimit: getOsEnv('USER_CONFIRMING_FIAT_LIMIT'),
    merchantSentFiatLimit: getOsEnv('MERCHANT_SENT_FIAT_LIMIT'),
    userSendingCryptoLimit: getOsEnv('USER_SENDING_CRYPTO_LIMIT'),
    userRequestSupportLimit: getOsEnv('USER_REQUEST_SUPPORT_LIMIT'),
  },
  chainId: {
    bsc: CHAIN_ID[getChainEnv()][CHAIN.BSC],
    polygon: CHAIN_ID[getChainEnv()][CHAIN.POLYGON],
    tron: CHAIN_ID[getChainEnv()][CHAIN.TRON],
    kdong: CHAIN_ID[getChainEnv()][CHAIN.KDONG],
  },
  rpc: {
    vchain: process.env.BLOCKCHAIN_VCHAIN_RPC_URL?.split(',') || [],
    bsc: process.env.BLOCKCHAIN_BSC_RPC_URL?.split(',') || [],
    polygon: process.env.BLOCKCHAIN_POLYGON_RPC_URL?.split(',') || [],
    ethereum: process.env.BLOCKCHAIN_ETHEREUM_RPC_URL?.split(',') || [],
    tron: process.env.BLOCKCHAIN_TRON_RPC_URL?.split(',') || [],
    kdong: process.env.BLOCKCHAIN_KDONG_RPC_URL?.split(',') || [],
  },
  explorerUrls: {
    bsc: process.env.BLOCKCHAIN_BSC_EXPLORER_URL?.split(',') || [],
    polygon: process.env.BLOCKCHAIN_POLYGON_EXPLORER_URL?.split(',') || [],
    ethereum: process.env.BLOCKCHAIN_ETHEREUM_EXPLORER_URL?.split(',') || [],
    tron: process.env.BLOCKCHAIN_TRON_EXPLORER_URL?.split(',') || [],
    kdong: process.env.BLOCKCHAIN_KDONG_EXPLORER_URL?.split(',') || [],
  },
  worker: {
    orderIntervalLimit: getOsEnv('ORDER_INTERVAL_LIMIT'),
    transactionIntervalLimit: getOsEnv('TRANSACTION_INTERVAL_LIMIT'),
  },
  oneSignalUser: {
    appId: getOsEnv('ONESIGNAL_APP_ID_USER'),
    apiKey: getOsEnv('ONESIGNAL_API_KEY_USER'),
    webDomain: getOsEnv('ONESIGNAL_WEB_DOMAIN_USER'),
  },
  oneSignalOperation: {
    appId: getOsEnv('ONESIGNAL_APP_ID_OPERATION'),
    apiKey: getOsEnv('ONESIGNAL_API_KEY_OPERATION'),
    webDomain: getOsEnv('ONESIGNAL_WEB_DOMAIN_OPERATION'),
  },
  oneSignalAdmin: {
    appId: getOsEnv('ONESIGNAL_APP_ID_ADMIN'),
    apiKey: getOsEnv('ONESIGNAL_API_KEY_ADMIN'),
    webDomain: getOsEnv('ONESIGNAL_WEB_DOMAIN_ADMIN'),
  },
  encryption: {
    key: getOsEnv('ENCRYPTION_KEY'),
    iv: getOsEnv('ENCRYPTION_IV'),
  },
  cronJob: {
    wipeCancelOrder: getOsEnv('CRON_JOB_WIPE_CANCEL_ORDER'),
    updateVolumeDataByDay: getOsEnv('CRON_JOB_UPDATE_VOLUME_DATA_BY_DAY'),
    resetMonthStatistic: getOsEnv('CRON_JOB_RESET_MONTH_STATISTIC'),
    clearUserNotHasOrder: getOsEnv('CRON_JOB_CLEAR_USER_NOT_HAS_ORDER'),
    handleMissingTransaction: getOsEnv('CRON_JOB_HANDLE_MISSING_TRANSACTION'),
    outBoxProducer: getOsEnv('CRON_OUT_BOX_PRODDUCER'),
    syncBankData: getOsEnv('CRON_JOB_SYNC_BANK_DATA'),
  },
  vietQr: {
    clientId: getOsEnv('VIETQR_CLIENT_ID'),
    apiKey: getOsEnv('VIETQR_API_KEY'),
    url: getOsEnv('VIETQR_QR_URL'),
    template: getOsEnv('VIETQR_QR_TEMPLATE'),
  },
  payment: {
    bankBOCApiUrl: getOsEnv('BANK_BOC_API_URL'),
    bankBOCAgent: getOsEnv('BANK_BOC_AGENT'),
    bankBOCCurrency: getOsEnv('BANK_BOC_CURRENCY'),
  },
  lock: {
    duration: Number(getOsEnv('LOCK_DURATION')),
  },
  cache: {
    responseDurationSec: Number(getOsEnv('CACHE_RESPONSE_DURATION_SEC')), // second
    searchPostTtl: Number(getOsEnv('CACHE_SEARCH_POST_TTL')), // second
    maxSearchPost: Number(getOsEnv('CACHE_MAX_SEARCH_POST')), // second
  },
  testMode: {
    statistic: Number(getOsEnv('STATISTIC_TEST_MODE_ON')),
  },
  dayClearUser: {
    enable: toBool(getOsEnv('CLEAR_USER_ENABLE')),
    dayClear: Number(getOsEnv('CLEAR_USER_DAY_NUMBER')),
  },
  cf: {
    enable: toBool(getOsEnv('CF_TURNSTILE_ENABLE')),
    turnstile: {
      secret_key: getOsEnv('CF_TURNSTILE_SECRET_KEY'),
    },
  },
  webDomain: {
    user: getOsEnv('WEB_DOMAIN_USER'),
    operation: getOsEnv('WEB_DOMAIN_OPERATION'),
    admin: getOsEnv('WEB_DOMAIN_ADMIN'),
    reporter: getOsEnv('WEB_DOMAIN_REPORTER'),
  },
  subDomain: {
    operation: getOsEnv('SUB_DOMAIN_OPERATION'),
    admin: getOsEnv('SUB_DOMAIN_ADMIN'),
    reporter: getOsEnv('SUB_DOMAIN_REPORTER'),
  },
  chatService: {
    apiKey: getOsEnv('CHAT_API_KEY'),
    prefixHeader: getOsEnv('CHAT_PREFIX_HEADER'),
    apiHash: getOsEnv('CHAT_API_KEY_HASH'),
    targetDomain: getOsEnv('CHAT_TARGET_DOMAIN'),
    proxyPrefix: getOsEnv('CHAT_PROXY_PREFIX'),
  },
  tronlink: {
    fullHost: getOsEnv('TRON_FULL_HOST'),
    privateKey: getOsEnv('TRON_PRIVATE_KEY'),
  },
  referral: {
    enable: toBool(getOsEnv('ENABLE_REFERRAL_CODE')),
  },
  rpcTimeout: Number(getOsEnv('RPC_TIMEOUT')),
  mercy: {
    timeout: Number(getOsEnv('MERCY_TIMEOUT_SECONDS')),
  },
  blacklist: {
    cron: getOsEnv('CRON_JOB_CRAWL_BLACKLIST'),
    crawlURL: getOsEnv('BLACKLIST_CRAWL_URL'),
  },
  telegramBot: {
    cronTimeToClearSecretKey: getOsEnv('CRON_JOB_CLEAR_SECRET_KEY_APPEAL'),
    clearAfterDays: Number(getOsEnv('CLEAR_SECRET_KEY_APPEAL_AFTER_DAYS')),
  },
  cryptoTransaction: {
    missingTransactionMinutes: Number(getOsEnv('MISSING_TRANSACTION_MINUTES')),
  },
  referenceExchangeRate: {
    searchURL: getOsEnv('REFERENCE_EXCHANGE_RATE_URL'),
  },
  aws: {
    credential: {
      key: getOsEnv('AWS_CREDENTIAL_KEY'),
      secret: getOsEnv('AWS_CREDENTIAL_SECRET'),
    },
    s3: {
      bucket: getOsEnv('AWS_S3_BUCKET'),
      region: getOsEnv('AWS_S3_REGION'),
      baseUrl: `https://${getOsEnv('AWS_S3_BUCKET')}.s3.${getOsEnv('AWS_S3_REGION')}.amazonaws.com`,
      presignedUrlTtl: Number(getOsEnv('AWS_S3_PRESIGNED_URL_TTL')) || 300, // seconds
      maxFileSize: getOsEnv('AWS_S3_MAX_FILE_SIZE') || '5mb',
    },
    cloudfront: {
      keyPairId: getOsEnv('AWS_CLOUDFRONT_KEY_PAIR_ID'),
      domainDistribution: getOsEnv('AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN'),
      privateKeyFilename: getOsEnv('AWS_CLOUDFRONT_PRIVATE_KEY_FILE_NAME') || 'aws-cloudfront-private-key.pem',
      signedCookieTtl: Number(getOsEnv('AWS_CREDENTIAL_SIGNED_COOKIE_TTL')) || 24, // hours
    },
  },
  rateLimitOption: {
    userLimit: Number(getOsEnv('USER_RATE_LIMIT')),
    userWindow: getOsEnv('USER_RATE_WINDOW'),
    operationLimit: Number(getOsEnv('OPERATION_RATE_LIMIT')),
    operationWindow: getOsEnv('OPERATION_RATE_WINDOW'),
  },
  kafka: {
    brokers: getOsEnv('KAFKA_BROKER_LIST')?.split(',') || [],
    clientId: getOsEnv('KAFKA_CLIENT_ID'),
    orders: {
      version: getOsEnvOptional('KAFKA_ORDER_EVENT_VERSION') || '1.0.0',
      topics: {
        v1: getOsEnvOptional('KAFKA_ORDER_TOPIC') || 'orders-v1',
        v2: getOsEnvOptional('KAFKA_ORDER_TOPIC_V2') || 'orders-v2',
      },
      backfill: {
        v1: {
          fromTime: getOsEnv('BACKFILL_KAFKA_ORDER_FROM')
            ? moment.utc(getOsEnv('BACKFILL_KAFKA_ORDER_FROM')).toDate()
            : undefined,
          toTime: getOsEnvOptional('BACKFILL_KAFKA_ORDER_TO')
            ? moment.utc(getOsEnv('BACKFILL_KAFKA_ORDER_TO')).toDate()
            : undefined,
          limit: getOsEnvOptional('BACKFILL_KAFKA_ORDER_LIMIT')
            ? Number(getOsEnv('BACKFILL_KAFKA_ORDER_LIMIT'))
            : undefined,
        },
      },
    },
  },
  resync: {
    fromTime: getOsEnv('RESYNC_KAFKA_ORDER_FROM')
      ? moment.utc(getOsEnv('RESYNC_KAFKA_ORDER_FROM')).toDate()
      : undefined,
    toTime: getOsEnvOptional('RESYNC_KAFKA_ORDER_TO')
      ? moment.utc(getOsEnv('RESYNC_KAFKA_ORDER_TO')).toDate()
      : undefined,
  },
  boc: {
    apiUrl: getOsEnv('BOC_BASE_API_URL'),
    agent: getOsEnv('BOC_API_AGENT'),
    apiKey: getOsEnv('BOC_API_KEY'),
  },
};
