import Redis from 'ioredis';

export type Context = { redis: Redis };

export type RatelimitResponse = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  windowMs: number
};

// export type Algorithm<TContext> = (ctx: TContext, identifier: string) => Promise<RatelimitResponse>;
export type Algorithm<TContext> = (
  ctx: TContext,
  identifier: string
) => {
  check: () => Promise<RatelimitResponse>;
  limit: () => Promise<RatelimitResponse>;
  clean: () => Promise<void>;
};
