/* eslint-disable @typescript-eslint/no-unused-vars */
import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';
import { NotificationType, OperationType } from '@api/common/models';
import { Statistic } from '@api/statistic/models/Statistic';
import { Operation } from '@api/profile/models/Operation';
import { v4 } from 'uuid';

export class OperationSeed implements Seeder {
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
      if (operators[n].statistic) {
        const statistic = new Statistic();
        statistic.id = operators[n].statistic.id;
        statistic.orderCompletedCount = operators[n].statistic.orderCompletedCount;
        statistic.totalOrderCount = operators[n].statistic.totalOrderCount;
        statistic.monthOrderCompletedCount = operators[n].statistic.monthOrderCompletedCount;
        statistic.monthOrderCount = operators[n].statistic.monthOrderCount;
        statistic.operationId = operators[n].id;
        await em.save(statistic);
        operator.statistic = statistic;
      }

      await em.save(operator);
    });
  }

  public async fetchOperators(): Promise<Operation[]> {
    const operators: Operation[] = [];

    // WARNING: must not delete for K6 testing
    const martinManagerId = v4();
    operators.push({
      id: martinManagerId,
      nickName: 'K6MartinManager',
      type: OperationType.MERCHANT_MANAGER,
      walletAddress: '0x019E935d55bF5291Fb2d1196B79d57AFb14AA7FB',
      statistic: {
        totalOrderCount: 0,
        orderCompletedCount: 0,
        monthOrderCount: 0,
        monthOrderCompletedCount: 0,
        operationId: martinManagerId,
      },
    } as Operation);
    // WARNING: must not delete for K6 testing
    const martinOperatorId = v4();
    operators.push({
      id: martinOperatorId,
      nickName: 'K6MartinOperator',
      type: OperationType.MERCHANT_OPERATOR,
      walletAddress: '0x2472EA96B554B5c48ab20595E47cCAE56f3865C6',
      merchantLevel: 1,
      merchantManagerId: martinManagerId,
      statistic: {
        totalOrderCount: 0,
        orderCompletedCount: 0,
        monthOrderCount: 0,
        monthOrderCompletedCount: 0,
        operationId: martinOperatorId,
      },
    } as Operation);
    // WARNING: must not delete for K6 testing
    const vanManagerId = v4();
    operators.push({
      id: vanManagerId,
      nickName: 'VanManager',
      type: OperationType.MERCHANT_MANAGER,
      walletAddress: '0x21eFEec59A0d12d00c6d2F528dd5b4a070dcF76B',
      statistic: {
        totalOrderCount: 0,
        orderCompletedCount: 0,
        monthOrderCount: 0,
        monthOrderCompletedCount: 0,
        operationId: vanManagerId,
      },
    } as Operation);
    const vanOperatorId = v4();
    operators.push({
      id: vanOperatorId,
      nickName: 'K6VanOperator',
      type: OperationType.MERCHANT_OPERATOR,
      walletAddress: '0xE7dD7Fa7c6722b5b35716bf2B07873eBccFa7803',
      merchantLevel: 1,
      merchantManagerId: vanManagerId,
      statistic: {
        totalOrderCount: 0,
        orderCompletedCount: 0,
        monthOrderCount: 0,
        monthOrderCompletedCount: 0,
        operationId: vanOperatorId,
      },
    } as Operation);

    return new Promise((resolve) => {
      resolve(operators);
    });
  }
}
