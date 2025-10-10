// tslint:disable:typedef
// tslint:disable:member-ordering
import ConnectRedis from 'connect-redis';
import session from 'express-session';
import uid from 'uid-safe';
import md5 from 'md5';

import { Logger } from './logger';
import redisClient from './redis-client';
import { calculateSha1 } from './p2p.utils';
import { env } from '@base/env';

export class SessionUtil {
  protected static log: Logger = new Logger(__filename);

  protected static redisStore: any;

  protected static redisClient: any;

  protected static sessionDefaultStore: any;
  protected static sessionStore: any;
  protected static sessionOperationStore: any;
  protected static sessionAdminStore: any;
  protected static sessionReporterStore: any;

  protected static sessionPrefixKey = 'sess:';

  protected static scanCount = 100;

  public static cookieDefaultKey = `_p2pd_sess`;
  public static cookieKey = `_p2pd_${md5('sess').slice(0, 8)}`;
  public static operationCookieKey = `_p2pd_${md5('sess_operation').slice(0, 8)}`;
  public static adminCookieKey = `_p2pd_${md5('sess_admin').slice(0, 8)}`;
  public static reporterCookieKey = `_p2pd_${md5('sess_reporter').slice(0, 8)}`;

  protected static isInitialize = false;

  public static initialize(): SessionUtil {
    if (SessionUtil.isInitialize) {
      return this;
    }

    SessionUtil.redisStore = ConnectRedis(session);
    SessionUtil.redisClient = redisClient;
    SessionUtil.sessionDefaultStore = session({
      genid: SessionUtil.genid,
      secret: env.app.sessionSecret,
      name: SessionUtil.cookieDefaultKey,
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      rolling: true,
      store: new SessionUtil.redisStore({
        client: SessionUtil.redisClient,
        ttl: Number(env.app.userSessionExpire),
        prefix: SessionUtil.sessionPrefixKey,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 1000 * Number(env.app.userSessionExpire),
        domain: env.app.sessionDomain,
      },
    });
    SessionUtil.sessionStore = session({
      genid: SessionUtil.genid,
      secret: env.app.sessionSecret,
      name: SessionUtil.cookieKey,
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      rolling: true,
      store: new SessionUtil.redisStore({
        client: SessionUtil.redisClient,
        ttl: Number(env.app.userSessionExpire),
        prefix: SessionUtil.sessionPrefixKey,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 1000 * Number(env.app.userSessionExpire),
        domain: env.app.sessionDomain,
      },
    });
    SessionUtil.sessionOperationStore = session({
      genid: SessionUtil.genid,
      secret: env.app.sessionSecret,
      name: SessionUtil.operationCookieKey,
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      rolling: true,
      store: new SessionUtil.redisStore({
        client: SessionUtil.redisClient,
        ttl: Number(env.app.operationSessionExpire),
        prefix: SessionUtil.sessionPrefixKey,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 1000 * Number(env.app.operationSessionExpire),
        domain: env.app.sessionDomain,
      },
    });
    SessionUtil.sessionAdminStore = session({
      genid: SessionUtil.genid,
      secret: env.app.sessionSecret,
      name: SessionUtil.adminCookieKey,
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      rolling: true,
      store: new SessionUtil.redisStore({
        client: SessionUtil.redisClient,
        ttl: Number(env.app.adminSessionExpire),
        prefix: SessionUtil.sessionPrefixKey,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 1000 * Number(env.app.adminSessionExpire),
        domain: env.app.sessionDomain,
      },
    });
    SessionUtil.sessionReporterStore = session({
      genid: SessionUtil.genid,
      secret: env.app.sessionSecret,
      name: SessionUtil.reporterCookieKey,
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      rolling: true,
      store: new SessionUtil.redisStore({
        client: SessionUtil.redisClient,
        ttl: Number(env.app.adminSessionExpire),
        prefix: SessionUtil.sessionPrefixKey,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 1000 * Number(env.app.adminSessionExpire),
        domain: env.app.sessionDomain,
      },
    });

    SessionUtil.isInitialize = true;

    return this;
  }

  public static getDefaultSessionStore() {
    if (!SessionUtil.sessionDefaultStore) {
      SessionUtil.initialize();
    }
    return SessionUtil.sessionDefaultStore;
  }

  public static getSessionStore() {
    if (!SessionUtil.sessionStore) {
      throw new Error(`You need to initialize ${SessionUtil.name}`);
    }
    return SessionUtil.sessionStore;
  }

  public static getSessionOperationStore() {
    if (!SessionUtil.sessionOperationStore) {
      throw new Error(`You need to initialize ${SessionUtil.name}`);
    }
    return SessionUtil.sessionOperationStore;
  }

  public static getSessionAdminStore() {
    if (!SessionUtil.sessionAdminStore) {
      throw new Error(`You need to initialize ${SessionUtil.name}`);
    }
    return SessionUtil.sessionAdminStore;
  }

  public static getSessionReporterStore() {
    if (!SessionUtil.sessionReporterStore) {
      throw new Error(`You need to initialize ${SessionUtil.name}`);
    }
    return SessionUtil.sessionReporterStore;
  }

  public static destroy(sid: string) {
    SessionUtil.getAllKeys(sid, (err, keys) => {
      if (err) {
        SessionUtil.log.error(`Cannot destroy session id: ${sid}`, err);
      }
      if (keys?.length) {
        SessionUtil.redisClient.del(keys);
      }
    });
  }

  public static generateHash(str: string) {
    return calculateSha1(str, env.app.sessionSecret);
  }

  public static changeSessionPrefixKey(prefix: string) {
    SessionUtil.sessionPrefixKey = prefix;
  }

  public static changeScanCount(scanCount: number) {
    SessionUtil.scanCount = scanCount;
  }

  public static genid(req: any) {
    if (!req.user) {
      return uid.sync(24);
    }
    return SessionUtil.generateHash(req.user.id.toString()) + uid.sync(24);
  }

  // https://github.com/tj/connect-redis/blob/master/lib/connect-redis.js#L149
  protected static getAllKeys(sid: string, cb: (...args: any) => void) {
    const pattern = SessionUtil.sessionPrefixKey + SessionUtil.generateHash(sid) + '*';
    SessionUtil.scanKeys({}, 0, pattern, SessionUtil.scanCount, cb);
  }

  // https://github.com/tj/connect-redis/blob/master/lib/connect-redis.js#L154
  protected static scanKeys(keys = {}, cursor, pattern, count, cb: (...args: any) => void) {
    const args = [cursor, 'match', pattern, 'count', count];
    SessionUtil.redisClient.scan(args, (err, data) => {
      if (err) {
        return cb(err);
      }

      const [nextCursorId, scanKeys] = data;
      for (const key of scanKeys) {
        keys[key] = true;
      }

      // SessionUtil.can be a string or a number. We check both.
      if (Number(nextCursorId) !== 0) {
        return SessionUtil.scanKeys(keys, nextCursorId, pattern, count, cb);
      }

      cb(null, Object.keys(keys));
    });
  }
}
