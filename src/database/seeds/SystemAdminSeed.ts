import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { NotificationType, OperationType } from '@api/common/models';
import { v4 } from 'uuid';
import { Operation } from '../../api/profile/models/Operation';

export class SystemAdminSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const em = connection.createEntityManager();
    const admins = await this.fetchAdmins();
    await times(admins.length, async (n) => {
      const admin: Operation = new Operation();
      admin.id = admins[n].id;
      admin.nickName = admins[n].nickName;
      admin.type = admins[n].type;
      admin.merchantLevel = admins[n].merchantLevel;
      admin.walletAddress = admins[n].walletAddress;
      admin.lockEndTime = admins[n].lockEndTime;
      admin.merchantManagerId = admins[n].merchantManagerId;
      admin.allowNotification = [NotificationType.ALL];
      admin.peerChatId = admins[n].peerChatId;
      await em.save(admin);
    });
  }

  public async fetchAdmins(): Promise<Operation[]> {
    const admins: Operation[] = [];

    admins.push({
      id: v4(),
      nickName: 'XukaSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x7b6B0A285FD19C7D892D1aaFF60BFD2CB202ca94',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'DoremonSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x3018Ac60d77e6F16EdF320388908Ce6b00C1DE4a',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'ChaienSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0xa38B8ae69624474b3fbaeae4c1C6201aD6B2c736',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'XekoSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0xbB6F3d4e0806000a3cEE228757064254763D9788',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'YoneSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0xE418C9eC1bD81fb7762807Ae8aE6483B6710Ee97',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'ConanSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x6e72904FBA1F6EDDFaC4720539E8305EF2BdCDe7',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'LuffySystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x0815CEc1d949F6761c86B4153Ba9215852b10482',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'YasuoSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x7B6c998D102f439442183141a37674A9d803385f',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'GragasSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0xE9EeC62701ec1252AbC81E18e7Ca68b27f8018E5',
    } as unknown as Operation);
    admins.push({
      id: v4(),
      nickName: 'LeesinSystemAdmin',
      type: OperationType.SYSTEM_ADMIN,
      walletAddress: '0x39509D0892eEbBF8dDFdb70077fa108d5f18c8bC',
    } as unknown as Operation);
    return new Promise((resolve) => {
      resolve(admins);
    });
  }
}
