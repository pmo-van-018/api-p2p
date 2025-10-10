import type { Algorithm, Context, RatelimitResponse } from './types';

export type RatelimitConfig<TContext> = {
  limiter: Algorithm<TContext>;
  ctx: TContext;
  prefix?: string;
};

export class RateLimit<TContext extends Context> {
  private readonly limiter: Algorithm<TContext>;

  private readonly ctx: TContext;

  private readonly prefix: string;

  constructor(config: RatelimitConfig<TContext>) {
    this.ctx = config.ctx;
    this.limiter = config.limiter;
    this.prefix = config.prefix ?? '@p2p/rtl';
  }

  public async check(identifier: string): Promise<RatelimitResponse> {
    const key = [this.prefix, identifier].join(':');
    const res = await this.limiter(this.ctx, key).check();
    return res;
  }

  public async limit(identifier: string): Promise<RatelimitResponse> {
    const key = [this.prefix, identifier].join(':');
    const res = await this.limiter(this.ctx, key).limit();
    return res;
  }

  public async clean(identifier: string): Promise<void> {
    const key = [this.prefix, identifier].join(':');
    await this.limiter(this.ctx, key).clean();
  }
}
