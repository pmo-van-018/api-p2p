import { Strategy } from 'passport-strategy';
import * as url from 'url';
import { SIStrategyFactory } from './sign-in.strategy';
import { originalOrigin } from './utils';
import { ParsedMessage } from './messsage-parser/parsed-message';
export class WalletSignInPassport extends Strategy {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private name: string;
  private options: any;
  private verify: any;
  constructor(options: any, verify: any) {
    super();
    if (typeof options === 'function') {
      verify = options;
      options = {};
    }
    if (!verify) {
      throw new TypeError('EthereumStrategy requires a verify function');
    }
    this.verify = verify;
    this.name = options.name;
    this.options = options;
  }

  public async authenticate(req: any, options: any): Promise<void> {
    try {
      await this._authenticate(req, options);
    } catch (ex) {
      return this.error(ex as Error);
    }
  }

  private async _authenticate(req: any, options: any): Promise<void> {
    const { message, signature } = req.body;
    const signInStrategy = SIStrategyFactory.from(req.body.loginType);

    if (!message) {
      return this.fail({ message: 'SIWE_MISSING_MESSAGE' }, 400);
    }
    if (!signature) {
      return this.fail({ message: 'SIWE_MISSING_SIGNATURE' }, 400);
    }
    let signInMessage: ParsedMessage;
    try {
      signInMessage = signInStrategy.unmarshalMessage(message);
    } catch (ex) {
      return this.fail({ message: 'SIWE_MALFORMED_MESSAGE' }, 403);
    }

    const origin = originalOrigin(req, options);
    if (origin !== signInMessage.uri) {
      return this.fail({ message: 'SIWE_INVALID_ORIGIN' }, 403);
    }
    if (url.parse(origin).host !== signInMessage.domain) {
      return this.fail({ message: 'SIWE_DOMAIN_MISMATCH' }, 403);
    }
    if (signInMessage.expirationTime && new Date(signInMessage.expirationTime).getTime() < new Date().getTime()) {
      return this.fail({ message: 'SIWE_EXPIRED_MESSAGE' }, 403);
    }
    if (signInMessage.notBefore && new Date(signInMessage.notBefore).getTime() > new Date().getTime()) {
      return this.fail({ message: 'SIWE_NOT_YET_VALID_TIME' }, 403);
    }

    const { ok } = await this._verifyNonce(req, signInMessage.nonce);
    if (!ok) {
      return this.fail('SIWE_INVALID_NONCE', 403);
    }
    if (!await signInStrategy.verifySignedMessage(message, signature, signInMessage)) {
      return this.fail({ message: 'SIWE_INVALID_SIGNATURE'} , 403);
    }

    if (this.options.passReqToCallback) {
      this.verify(req, signInMessage.address, this._verified.bind(this));
    } else {
      return this.verify.length === 3
        ? this.verify(signInMessage.address, signInMessage.chainId, this._verified.bind(this))
        : this.verify(signInMessage.address, this._verified.bind(this));
    }
  }

  private _verified(err: any, user: any, info: any) {
    if (err) {
      return this.error(err);
    }
    if (!user) {
      return this.fail(info, 401);
    }
    this.success(user, info);
  }

  private _verifyNonce(_req: any, _nonce: any): Promise<any> {
    return new Promise(resolve => {
      this.options.store.verify(_req, _nonce, (err, ok, info) => {
        resolve({ err, ok, info });
      });
    });
  }
}
