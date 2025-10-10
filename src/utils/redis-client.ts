import Redis from 'ioredis';
import bluebird from 'bluebird';
import { env } from '@base/env';
import { GetSortedSetType } from '@api/common/models/P2PEnum';
import { SavePriceCache } from '@api/post/types/Post';

const REDIS_TTL = 15 * 60;

/**
 * Create and return a Redis URL from environment variables
 * @returns {string}
 */
export function getRedisUrl() {
  return `redis://${env.redis.host}:${env.redis.port}`;
}

bluebird.promisifyAll(Redis);
const redisClient = new Redis(getRedisUrl());

const callingMaps: Map<string, Promise<unknown>> = new Map();

export async function getCache(key: string) {
  key = formatKeyByEnv(key);
  const value = await redisClient.get(key);
  if (value === null) {
    if (callingMaps.has(key)) {
      return callingMaps.get(key);
    }
  }
  if (value) {
    return JSON.parse(value);
  }
  return null;
}

type Fn<T> = () => Promise<T>;

export async function setCache<T>(key: string, fn: T | Fn<T>, ttl: number = REDIS_TTL) {
  key = formatKeyByEnv(key);
  let value: T;
  if (typeof fn === 'function') {
    try {
      const promise = (fn as Fn<T>)();
      // Store key + promise in callingMaps
      callingMaps.set(key, promise);
      value = await promise;
    } finally {
      // Remove key from callingMaps when done
      callingMaps.delete(key);
    }
  } else {
    value = fn;
  }
  if (ttl) {
    const data = JSON.stringify(value);
    await redisClient.set(key, data, 'EX', ttl); // EX = seconds. Docs: https://redis.io/commands/set/#options
  }
}

export async function deleteCache(key: string) {
  key = formatKeyByEnv(key);
  await redisClient.del(key);
}
export async function deleteCacheWildcard(key: string) {
  key = formatKeyByEnv(key);
  const keys = await redisClient.keys(key);
  for (let i = 0, j = keys.length; i < j; ++i) {
    await redisClient.del(keys[i]);
  }
}

export async function wrap<T>(key: string, fn: Fn<T>, ttl: number = REDIS_TTL): Promise<T> {
  let value: T = (await getCache(key)) as T;
  if (value === null) {
    const newKey = formatKeyByEnv(key);
    // Check if key is being processed in callingMaps
    if (callingMaps.has(newKey)) {
      return callingMaps.get(newKey) as Promise<T>;
    }
    try {
      const promise = fn();
      // Store key + promise in callingMaps
      callingMaps.set(newKey, promise);
      value = await promise;
    } finally {
      // Remove key from callingMaps when done
      callingMaps.delete(newKey);
    }
    if (value) {
      await setCache(key, value, ttl);
    }
  }
  return value;
}

export async function setSortedCache(key: string, value: number, id: string) {
  key = formatKeyByEnv(key);
  await redisClient.zadd(key, value, id);
}

export async function delSortedCache(key: string, id: string) {
  key = formatKeyByEnv(key);
  await redisClient.zrem(key, id);
}

export function getRecommendPriceCacheKey(data: SavePriceCache) {
  return `_cache_price_posting_#${data.assetId}#${data.postType}`;
}

export async function getSortedCache(key: string, type: GetSortedSetType, start?: number, end?: number) {
  key = formatKeyByEnv(key);
  let value;
  if (type === GetSortedSetType.maximum) {
    value = await redisClient.zrevrange(key, start || 0, end || 0, 'WITHSCORES');
  } else {
    value = await redisClient.zrange(key, start || 0, end || 0, 'WITHSCORES');
  }
  return value[1];
}

export function formatKeyByEnv(key: string) {
  return env.app.cacheEnv + key;
}

export default redisClient;
