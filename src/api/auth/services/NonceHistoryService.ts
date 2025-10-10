import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { setCache, getCache, deleteCache } from '@base/utils/redis-client';

@Service()
export class NonceHistoryService {
  constructor(private prefixKey: string = '__nonce__', @Logger(__filename) private log: LoggerInterface) {}

  public async saveNonce(nonce: string) {
    try {
      return await setCache(this.getNonceKey(nonce), { nonce }, Number(env.app.sessionNonceExpire));
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw error;
    }
  }

  public async getValidNonce(nonce: string) {
    try {
      const result = await getCache(this.getNonceKey(nonce));
      if (result && result.nonce) {
        await deleteCache(this.getNonceKey(nonce));
        return result;
      }
      return null;
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw error;
    }
  }

  private getNonceKey(nonce: string): string {
    return this.prefixKey + nonce;
  }
}
