import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { UserType } from '@api/common/models/P2PEnum';
import { User } from '@api/profile/models/User';
import { v4 } from 'uuid';

export class UserSeed implements Seeder {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async run(factory: Factory, connection: Connection): Promise<any> {
    // const em = connection.createEntityManager();
    const users = await this.fetchUsers();
    await times(users.length, async (n) => {
      const user: User = new User();
      user.id = users[n].id;
      user.nickName = users[n].nickName;
      user.type = users[n].type;
      user.walletAddress = users[n].walletAddress;
      user.lockEndTime = users[n].lockEndTime;

      //await em.save(user);
    });
  }

  public async fetchUsers(): Promise<User[]> {
    const users: User[] = [];

    users.push({
      id: v4(),
      nickName: 'Bin',
      type: UserType.USER,
      walletAddress: '0xa770691d519f6a87DcFc8E2F6489A21589457A62',
    } as User);

    users.push({
      id: v4(),
      nickName: 'EndUserJacob',
      type: UserType.USER,
      walletAddress: '0x6371a36c1E5fe524741782f5cFE2146172f622CF',
    } as User);
    users.push({
      id: v4(),
      nickName: 'EndUserWilliam',
      type: UserType.USER,
      walletAddress: '0x0668088849E82305e24564cFb943fF08b4d4a5e4',
    } as User);
    users.push({
      id: v4(),
      nickName: 'EndUserSunny',
      type: UserType.USER,
      walletAddress: '0x47a3c68181c2891FDB4e572CEEC0bB1519986Aad',
    } as User);
    users.push({
      id: v4(),
      nickName: 'EndUserNinii',
      type: UserType.USER,
      walletAddress: '0xBb685358779813a6d713A894882ABd833e86434a',
    } as User);

    return new Promise((resolve) => {
      resolve(users);
    });
  }
}
