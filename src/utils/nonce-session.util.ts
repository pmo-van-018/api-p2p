import randToken from 'rand-token';
import { NonceHistoryService } from '@api/auth/services/NonceHistoryService';
import { Container, Service } from 'typedi';

@Service()
export class SessionNonceStore {
  private _key = 'ethereum:siwe';
  private _missSessionMessage =
    'Ethereum authentication requires session support. Did you forget to use express-session middleware?';
  private nonceHistoryService = Container.get(NonceHistoryService);

  public challenge(req: any, cb: (...args: any[]) => void) {
    if (!req.session) {
      return cb(new Error(this._missSessionMessage));
    }

    process.nextTick(async () => {
      let isValidNonce = false;
      let nonce = '';
      do {
        nonce = randToken.generate(16);
        const existNonce = await this.nonceHistoryService.getValidNonce(nonce);
        isValidNonce = !existNonce;
      } while (!isValidNonce);
      await this.nonceHistoryService.saveNonce(nonce);
      req.session[this._key] = { nonce };
      return cb(null, nonce);
    });
  }

  public verify(req: any, nonce: string, cb: (...args: any[]) => void) {
    if (!req.session) {
      return cb(new Error(this._missSessionMessage));
    }

    process.nextTick(async () => {
      const info = req.session[this._key];
      delete req.session[this._key];

      if (!info || !info.nonce) {
        return cb(null, false, { message: 'Unable to verify nonce.' });
      }

      const existNonce = await this.nonceHistoryService.getValidNonce(info.nonce);

      if (!existNonce) {
        return cb(null, false, { message: 'Invalid nonce.' });
      }

      return cb(null, true);
    });
  }
}
