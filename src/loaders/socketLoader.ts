import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Server } from 'socket.io';
import { Container } from 'typedi';

import { ClientToServerEvents } from '@api/sockets/intefaces/ClientToServerEvents';
import { ServerToClientEvents } from '@api/sockets/intefaces/ServerToClientEvents';
import { SocketData } from '@api/sockets/intefaces/SocketData';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { AuthService } from '@api/auth/services/AuthService';
import { Session } from 'express-session';
import { createAdapter } from '@socket.io/redis-adapter';
import redisClient from '@base/utils/redis-client';
import { AuthMerchantService } from '@api/auth/services/AuthMerchantService';
import { AuthAdminService } from '@api/auth/services/AuthAdminService';
import { env } from '@base/env';
import { SessionUtil } from '@base/utils/session.util';
import { AuthUserPasswordService } from '@api/auth/services/AuthUserPasswordService';
declare module 'http' {
  interface IncomingMessage {
    session: Session & {
      authenticated: boolean;
    };
  }
}

export const socketLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  if (!settings) {
    return;
  }
  const server = settings.getData('express_server');
  const io = new Server<ClientToServerEvents, ServerToClientEvents, null, SocketData>(server, {
    cors: env.isDevelopment
      ? {
          // tslint:disable-next-line:typedef
          origin(_requestOrigin, callback) {
            callback(null, true);
          },
          credentials: true,
        }
      : { origin: false },
    path: '/api/socket.io',
  });
  const authService = Container.get(AuthService);
  const authOperationsService = Container.get(AuthMerchantService);
  const authAdminService = Container.get(AuthAdminService);
  const authUserPasswordService = Container.get(AuthUserPasswordService);
  const authen = () => (req, res, next) => {
    const refererHost = req.headers.referer || '';
    if (refererHost.includes(env.webDomain.admin)) {
      return authAdminService.getSessionMiddleware()(req, res, next);
    }
    if (refererHost.includes(env.webDomain.operation)) {
      return authOperationsService.getSessionMiddleware()(req, res, next);
    }
    if (refererHost.includes(env.webDomain.reporter)) {
      return authUserPasswordService.getSessionMiddleware()(req, res, next);
    }
    if (refererHost.includes(env.webDomain.user)) {
      return authService.getSessionMiddleware()(req, res, next);
    }

    return SessionUtil.getDefaultSessionStore()(req, res, next);
  };
  const wrap = (middleware) => (socket, next) => {
    return middleware(socket.request, {}, next);
  };
  io.use(wrap(authen()));
  io.adapter(createAdapter(redisClient, redisClient.duplicate()));
  Container.set('io', io);
  const socketFactory = Container.get(SocketFactory);
  io.on('connection', (socket) => {
    socketFactory.onConnect(socket);
  });
  settings.setData('io', io);
};
