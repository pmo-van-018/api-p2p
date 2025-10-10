import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { NotificationType, OperationType } from '@api/common/models';
import { v4 } from 'uuid';
import { Operation } from '../../api/profile/models/Operation';
import { USER_TYPE, getPeerChatId } from '@base/utils/chat.utils';

export class SupporterAdminSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const em = connection.createEntityManager();
    const operators = await this.fetchAdminSupporters();
    await times(operators.length, async (n) => {
      const operator: Operation = new Operation();
      operator.id = operators[n].id;
      operator.nickName = operators[n].nickName;
      operator.type = operators[n].type;
      operator.walletAddress = operators[n].walletAddress;
      operator.lockEndTime = operators[n].lockEndTime;
      operator.merchantManagerId = operators[n].merchantManagerId;
      operator.allowNotification = [NotificationType.ALL];
      operator.peerChatId = operators[n].peerChatId;
      await em.save(operator);
    });
  }

  public async fetchAdminSupporters(): Promise<Operation[]> {
    const operators: Operation[] = [];

    operators.push({
      id: v4(),
      nickName: 'DoremonSupporter',
      type: OperationType.ADMIN_SUPPORTER,
      walletAddress: '0x0720b2715Ad21568025612db28FC2A3ddc701E94',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'MinwoAdminSupporter',
      type: OperationType.ADMIN_SUPPORTER,
      walletAddress: '0xD760365DBA5f6568B23844eAceb8e2bd80f8d8BF',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);

    operators.push({
      id: v4(),
      nickName: 'JacobCamleAdminSupporter',
      type: OperationType.ADMIN_SUPPORTER,
      walletAddress: '0xE87583144ed032A24176ed2a90A4C173Bf336BBb',
      peerChatId: await getPeerChatId(USER_TYPE.ADMIN),
    } as unknown as Operation);
    return new Promise((resolve) => {
      resolve(operators);
    });
  }
}
