import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { NotificationType, OperationType } from '@api/common/models';
import { v4 } from 'uuid';
import { Operation } from '../../api/profile/models/Operation';
import { USER_TYPE, getPeerChatId } from '@base/utils/chat.utils';

export class OpeartionAdminSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const em = connection.createEntityManager();
    const operators = await this.fetchOperators();
    await times(operators.length, async (n) => {
      const operator: Operation = new Operation();
      operator.id = operators[n].id;
      operator.nickName = operators[n].nickName;
      operator.type = operators[n].type;
      operator.merchantLevel = operators[n].merchantLevel;
      operator.walletAddress = operators[n].walletAddress;
      operator.lockEndTime = operators[n].lockEndTime;
      operator.merchantManagerId = operators[n].merchantManagerId;
      operator.allowNotification = [NotificationType.ALL];
      operator.peerChatId = operators[n].peerChatId;
      // if (operators[n].statistic) {
      //   const statistic = new Statistic();
      //   statistic.id = operators[n].statistic.id;
      //   statistic.orderCompletedCount = operators[n].statistic.orderCompletedCount;
      //   statistic.totalOrderCount = operators[n].statistic.totalOrderCount;
      //   statistic.monthOrderCompletedCount = operators[n].statistic.monthOrderCompletedCount;
      //   statistic.monthOrderCount = operators[n].statistic.monthOrderCount;
      //   statistic.operationId = operators[n].id;
      //   await em.save(statistic);
      //   operator.statistic = statistic;
      // }

      await em.save(operator);
    });
  }

  public async fetchOperators(): Promise<Operation[]> {
    const operators: Operation[] = [];

    operators.push({
      id: v4(),
      nickName: 'SuperAdminMin',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x9DFbFCA6415BCAd551589964cbF3fDB999f2f15b',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    operators.push({
      id: v4(),
      nickName: 'SuperAdminPi',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x07d90e4a77a931256EF13AFD18A15D1FF36d76ee',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'EricEdgeAdmin',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x07C6Cc05918A831156D9152F1482E2183223034e',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminJacob',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x16B6A18303e5b7627bF807A21fBE00125d8508D1',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminWilliam',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0xAffAD29CB4C124072f8590701fEd1c40c3Df656a',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminSunny',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x65Dad3d2274086073F8C7d695cE7B4d201C74Bd9',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminNinii',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0xAE9FD48D5E24c914789A0865cd5711e457617006',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminStark',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x6C150D2049A161d599B66b0f29682ef3bfAb5cE3',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'SuperAdminTeddy',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0xe64FC08dC7ce7D5956b0c018345D58CfF0EF0517',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    operators.push({
      id: v4(),
      nickName: 'SuperAdminMichael',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x09451f58a1Ca0B71878dA68F8698c8c5B98dA135',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    operators.push({
      id: v4(),
      nickName: 'SuperAdminVan',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0x6687D8d8dF0660E578193370C7371b4916BC366f',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    operators.push({
      id: v4(),
      nickName: 'SuperAdminAiden',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0xAbD90F1c3D60Ee4bad81574F41c8D072190e2C2D',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    operators.push({
      id: v4(),
      nickName: 'SuperAdminL',
      type: OperationType.SUPER_ADMIN,
      walletAddress: '0xab88B73AeDdab8Bf0a6871F2DFb66b3359b779A7',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    return new Promise((resolve) => {
      resolve(operators);
    });
  }
}
