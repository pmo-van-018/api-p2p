import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Connection, createConnection as typeormCreateConnection, getConnectionOptions } from 'typeorm';
import { env } from '../env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const connection = await createConnection();

  if (settings) {
    settings.setData('connection', connection);
    settings.onShutdown(() => {
      connection.close();
    });
  }
};

export const createConnection = async (): Promise<Connection> => {
  const loadedConnectionOptions = await getConnectionOptions();
  const connectionOptions = Object.assign(loadedConnectionOptions, {
    type: env.db.type as any, // See createConnection options for valid types
    host: env.db.host,
    port: env.db.port,
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    synchronize: env.db.synchronize,
    logging: env.isProduction ? ['error'] : env.db.logging,
    entities: env.app.dirs.entities,
    migrations: env.app.dirs.migrations,
    connectTimeout: 60000,
    timezone: 'Z',
    extra: {
      connectionLimit: 400,
      compress: true,
    },
  });

  const connection = await typeormCreateConnection(connectionOptions);

  return connection;
};
