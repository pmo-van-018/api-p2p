import { authorizationChecker } from '@api/auth/services/authorizationChecker';
import { currentUserChecker } from '@api/auth/services/currentUserChecker';
import express, { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { env } from '../env';
import { useFactoryExpressServer } from './custom';

export const expressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  if (settings) {
    const connection = settings.getData('connection');
    const app = express();

    // Only set CORS when running in local development
    if (env.isDevelopment) {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.header('origin'));
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Forwarded-Proto, X-Forwarded-Host, X-Requested-With, Content-Type, Accept, Authorization, X-Domain'
        );
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

        if (req.method === 'OPTIONS') {
          res.status(200).end();
        } else {
          next();
        }
      });
    }

    app.use((req, res, next) => {
      req.headers['x-forwarded-proto'] = String(req.headers['x-forwarded-proto'] || '').replace(': ', '');
      next();
    });

    const chatProxyOptions = {
      target: env.chatService.targetDomain,
      changeOrigin: true,
      ws: true,
    };
    const chatProxy = createProxyMiddleware(['/api/rooms', '/ws/chat', '/api/admin/rooms'], chatProxyOptions);
    app.use(chatProxy);

    app.set('trust proxy', 1);
    const expressApp: Application = useFactoryExpressServer(env.express.adapter, app, {
      classTransformer: true,
      routePrefix: env.app.routePrefix,
      defaultErrorHandler: false,
      controllers: env.app.dirs.controllers,
      middlewares: env.app.dirs.middlewares,

      /**
       * Authorization
       */

      authorizationChecker: authorizationChecker(connection),
      currentUserChecker: currentUserChecker(connection),
    });

    if (!env.isTest) {
      const server = expressApp.listen(env.app.port);
      settings.setData('express_server', server);
    }

    settings.setData('express_app', expressApp);
  }
};
