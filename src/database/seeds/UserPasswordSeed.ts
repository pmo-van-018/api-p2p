import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { hash } from '@base/utils/crypto';
import { UserPassword } from '@api/profile/models/UserPassword';

const DEFAULT_PASSWORD = '12345678';

export class UserPasswordSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const em = connection.createEntityManager();
    const localUsers = await this.fetchLocalUsers();
    await times(localUsers.length, async (n) => {
      const localUser = new UserPassword();

      localUser.id = localUsers[n].id;
      localUser.username = localUsers[n].username;
      localUser.password = await hash(localUsers[n].password);

      return await em.save(localUser);
    });
  }

  public async fetchLocalUsers(): Promise<UserPassword[]> {
    const localUsers: UserPassword[] = [];
    localUsers.push({
      username: 'anotrade_reporter_001',
      password: DEFAULT_PASSWORD,
    } as UserPassword);
    return new Promise((resolve) => {
      resolve(localUsers);
    });
  }
}
