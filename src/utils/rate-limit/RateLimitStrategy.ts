import { ms } from './Duration';
import type { Duration } from './Duration';
import type { Algorithm, Context } from './types';

export class RateLimitStrategy {
  static slidingWindowLog(tokens: number, window: Duration): Algorithm<Context> {
    const scriptCheck = `
      local tokens = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local window = tonumber(ARGV[3])

      local min = now - window
      local max = now

      local count = redis.call('ZCOUNT', KEYS[1], min, max)
      local updatedAt = redis.call('ZRANGEBYSCORE', KEYS[1], min, max, 'LIMIT', 0, 1)
      if #updatedAt == 0 then
        return {tokens - count, now + window}
      end
      return {tokens - count, tonumber(updatedAt[1]) + window}
      `;
    const scriptAcquire = `
      local tokens = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local window = tonumber(ARGV[3])

      local min = now - window
      local max = now

      local count = redis.call('ZCOUNT', KEYS[1], min, max)

      if count == 0 then
        -- clear the key
        redis.call('EXPIRE', KEYS[1], window)
        -- clear previous window
        redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', min)
      end


      local updatedAt = redis.call('ZRANGEBYSCORE', KEYS[1], min, max, 'LIMIT', 0, 1)
      if #updatedAt == 0 then
        redis.call('ZADD', KEYS[1], now, max)
        return {tokens - count - 1, now + window}
      end

      if count >= tokens then
        return {-1, tonumber(updatedAt[1]) + window}
      end

      redis.call('ZADD', KEYS[1], now, max)

      return {tokens - count - 1, tonumber(updatedAt[1]) + window}
      `;
    const scriptClean = `
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', '+inf')
      `;
    const windowSize = ms(window);
    return function (ctx: Context, identifier: string) {
      return {
        check: async () => {
          const now = Date.now();

          const [remaining, reset] = (await ctx.redis.eval(scriptCheck, 1, [
            identifier,
            tokens,
            now,
            windowSize,
          ] as any[])) as [number, number];
          const success = remaining > 0;

          return {
            success,
            limit: tokens,
            remaining: Math.max(0, remaining),
            resetMs: reset,
            windowMs: windowSize,
          };
        },
        limit: async () => {
          const now = Date.now();

          const [remaining, reset] = (await ctx.redis.eval(scriptAcquire, 1, [
            identifier,
            tokens,
            now,
            windowSize,
          ] as any[])) as [number, number];
          const success = remaining >= 0;

          return {
            success,
            limit: tokens,
            remaining: Math.max(0, remaining),
            resetMs: reset,
            windowMs: windowSize,
          };
        },
        clean: async () => {
          await ctx.redis.eval(scriptClean, 1, [identifier]);
        },
      };
    };
  }

  static slidingWindow(tokens: number, window: Duration): Algorithm<Context> {
    const scriptCheck = `
      local currentKey  = KEYS[1]           -- identifier including prefixes
      local previousKey = KEYS[2]           -- key of the previous bucket
      local tokens      = tonumber(ARGV[1]) -- tokens per window
      local now         = ARGV[2]           -- current timestamp in milliseconds
      local window      = ARGV[3]           -- interval in milliseconds

      local requestsInCurrentWindow = redis.call("GET", currentKey)
      if requestsInCurrentWindow == false then
        requestsInCurrentWindow = -1
      end


      local requestsInPreviousWindow = redis.call("GET", previousKey)
      if requestsInPreviousWindow == false then
        requestsInPreviousWindow = 0
      end
      local percentageInCurrent = ( now % window) / window
      if requestsInPreviousWindow * ( 1 - percentageInCurrent ) + requestsInCurrentWindow >= tokens then
        return -1
      end

      local count = redis.call("GET", currentKey)
      if count == false then
        count = 0
      end
      return tokens - count
      `;
    const scriptAcquire = `
      local currentKey  = KEYS[1]           -- identifier including prefixes
      local previousKey = KEYS[2]           -- key of the previous bucket
      local tokens      = tonumber(ARGV[1]) -- tokens per window
      local now         = ARGV[2]           -- current timestamp in milliseconds
      local window      = ARGV[3]           -- interval in milliseconds

      local requestsInCurrentWindow = redis.call("GET", currentKey)
      if requestsInCurrentWindow == false then
        requestsInCurrentWindow = -1
      end


      local requestsInPreviousWindow = redis.call("GET", previousKey)
      if requestsInPreviousWindow == false then
        requestsInPreviousWindow = 0
      end
      local percentageInCurrent = ( now % window) / window
      if requestsInPreviousWindow * ( 1 - percentageInCurrent ) + requestsInCurrentWindow >= tokens then
        return -1
      end

      local newValue = redis.call("INCR", currentKey)
      if newValue == 1 then
        -- The first time this key is set, the value will be 1.
        -- So we only need the expire command once
        redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
      end
      return tokens - newValue
      `;
    const scriptClean = ``;
    const windowSize = ms(window);
    return function (ctx: Context, identifier: string) {
      return {
        check: async () => {
          const now = Date.now();

          const currentWindow = Math.floor(now / windowSize);
          const currentKey = [identifier, currentWindow].join(':');
          const previousWindow = currentWindow - windowSize;
          const previousKey = [identifier, previousWindow].join(':');

          const remaining = (await ctx.redis.eval(scriptCheck, 2, [
            currentKey,
            previousKey,
            tokens,
            now,
            windowSize,
          ] as any[])) as number;

          const success = remaining >= 0;
          const reset = (currentWindow + 1) * windowSize;

          return {
            success,
            limit: tokens,
            remaining: Math.max(0, remaining),
            resetMs: reset,
            windowMs: windowSize,
          };
        },
        limit: async () => {
          const now = Date.now();

          const currentWindow = Math.floor(now / windowSize);
          const currentKey = [identifier, currentWindow].join(':');
          const previousWindow = currentWindow - windowSize;
          const previousKey = [identifier, previousWindow].join(':');

          const remaining = (await ctx.redis.eval(scriptAcquire, 2, [
            currentKey,
            previousKey,
            tokens,
            now,
            windowSize,
          ] as any[])) as number;

          const success = remaining >= 0;
          const reset = (currentWindow + 1) * windowSize;
          return {
            success,
            limit: tokens,
            remaining: Math.max(0, remaining),
            resetMs: reset,
            windowMs: windowSize,
          };
        },
        clean: async () => {
          await ctx.redis.eval(scriptClean);
        },
      };
    };
  }
}
