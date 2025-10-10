import { env } from '@base/env';
import Redlock, { ExecutionResult, Lock, Settings, type RedlockAbortSignal } from 'redlock';
import redisClient from './redis-client';
import { DEFAULT_ACQUIRE_SETTING } from '@api/common/constants/RedlockConstant';

export class RedlockUtil {
  public static getInstance() {
    if (!this.instance) {
      this.instance = new Redlock([redisClient], { retryCount: 60, retryDelay: 500 });
    }
    return this.instance;
  }

  public static async acquire(keys: string | string[], duration?: number, settings?: Partial<Settings>) {
    return this.getInstance().acquire(Array.isArray(keys) ? keys : [keys], duration ?? this.duration, settings);
  }

  public static async release(lock: Lock, settings?: Partial<Settings>): Promise<ExecutionResult> {
    return this.getInstance().release(lock, settings);
  }

  public static async extend(existing: Lock, duration?: number, settings?: Partial<Settings>): Promise<Lock> {
    return this.getInstance().extend(existing, duration ?? duration, settings);
  }

  public static async using<T>(
    resources: string[],
    duration?: number,
    settings?: Partial<Settings>,
    routine?: (signal: RedlockAbortSignal) => Promise<T>
  ) {
    if (settings) {
      return this.getInstance().using(resources, duration ?? this.duration, settings, routine);
    }
    return this.getInstance().using(resources, duration ?? this.duration, routine);
  }

  public static async lock(key: string, cb: any) {
    const lock = await RedlockUtil.acquire(key, null, DEFAULT_ACQUIRE_SETTING);
    try {
      return await cb();
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      await RedlockUtil.release(lock);
    }
  }

  private static instance: Redlock;

  private static duration = env.lock.duration;
}
