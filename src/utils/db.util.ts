import { TypeORMError } from 'typeorm';
import { Logger } from '@base/utils/logger';

const ER_LOCK_DEADLOCK = 1213;
const ER_LOCK_TIMEOUT = 1213;
const ER_LOCK_WAIT_TIMEOUT = 1205;

const logger = new Logger(__filename);

const delay = (fn: any, ms: number) => new Promise((resolve) => setTimeout(() => resolve(fn()), ms));

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const isQueryFailedError = (err: unknown): err is TypeORMError => err instanceof TypeORMError;

export const retryTypeormTransaction = async (fn: any, maxAttempts: number, retryAll?: boolean) => {
  const execute = async (attempt: number) => {
    try {
      return await fn();
    } catch (err) {
      if (isQueryFailedError(err)) {
        const isDeadlockOrTimeout =
          err['errno'] === ER_LOCK_DEADLOCK ||
          err['errno'] === ER_LOCK_TIMEOUT ||
          err['sqlState'] === '40001' ||
          err['errno'] === ER_LOCK_WAIT_TIMEOUT;
        if (isDeadlockOrTimeout || retryAll) {
          if (attempt <= maxAttempts) {
            const nextAttempt = attempt + 1;
            const delayInMilliseconds = Math.pow(2, nextAttempt) * 100 + randInt(300, 1000);
            logger.error(`Retrying after ${delayInMilliseconds} ms due to:`, err);
            return await delay(async () => await execute(nextAttempt), delayInMilliseconds);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  };
  return await execute(1);
};
