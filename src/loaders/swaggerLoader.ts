// import {
//     defaultMetadataStorage as classTransformerMetadataStorage
// } from 'class-transformer/cjs/storage';
// import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import basicAuth from 'express-basic-auth';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';

import { env } from '../env';

export const swaggerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  if (settings && env.swagger.enabled) {
    const expressApp = settings.getData('express_app');

    // Parse class-validator classes into JSON Schema
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
    });

    // Parse routing-controllers classes into OpenAPI spec:
    const storage = getMetadataArgsStorage();

    const swaggerFile = routingControllersToSpec(
      storage,
      { routePrefix: env.app.routePrefix },
      {
        components: {
          schemas,
          securitySchemes: {
            basicAuth: {
              type: 'http',
              scheme: 'basic',
            },
            cookieAuth: {
              type: 'apiKey',
              in: 'cookie',
              name: 'JSESSIONID',
            },
          },
        },
      }
    );

    // Add npm infos to the swagger doc
    swaggerFile.info = {
      title: env.app.name,
      description: env.app.description,
      version: env.app.version,
    };

    swaggerFile.servers = [
      {
        url: `${env.app.schema}://${env.app.host}:${env.app.port}`,
      },
      {
        url: `${env.app.domain}`,
      },
    ];

    expressApp.use(
      env.swagger.route,
      env.swagger.username
        ? basicAuth({
            users: {
              [`${env.swagger.username}`]: env.swagger.password,
            },
            challenge: true,
          })
        : (req, res, next) => next(),
      swaggerUi.serve,
      swaggerUi.setup(swaggerFile)
    );
  }
};
