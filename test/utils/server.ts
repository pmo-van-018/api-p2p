// import { setConnection } from 'typeorm-seeding';

import { bootstrapApp } from './bootstrap';
import { migrateDatabase } from './database';

export const prepareServer = async (options?: { migrate: boolean }) => {
  const settings = await bootstrapApp();
  if (options && options.migrate) {
    await migrateDatabase(settings.connection);
  }
  // setConnection(settings.connection);
  return settings;
};
