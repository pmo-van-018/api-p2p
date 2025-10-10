import { SessionUtil } from '@base/utils/session.util';
import { SessionNonceStore } from '@base/utils/nonce-session.util';
import passport from '@api/auth/services/sign-in-with-wallet/passport';

export abstract class BaseAuthService {
  protected sessionNonceStore: any;
  protected sessionMiddleware: any;
  protected constructor(sessionExpire: string) {
    SessionUtil.initialize();
  }
  public initSessionStore() {
    this.initSessionMiddleware();
    const store = new SessionNonceStore();
    this.sessionNonceStore = store;
    passport.use(this.strategyP2PAuthentication(store));
    passport.serializeUser((user, cb) => {
      process.nextTick(() => {
        cb(null, user);
      });
    });
    passport.deserializeUser((user, cb) => {
      process.nextTick(() => {
        return cb(null, user);
      });
    });
  }
  public getSessionNonceStore() {
    return this.sessionNonceStore;
  }

  public getSessionMiddleware() {
    return this.sessionMiddleware;
  }

  public async prepareLoginResponse() {
    return {
      success: true,
    };
  }

  public abstract strategyP2PAuthentication(store: SessionNonceStore);

  protected initSessionMiddleware() {
    this.sessionMiddleware = SessionUtil.getSessionStore();
  }
}
