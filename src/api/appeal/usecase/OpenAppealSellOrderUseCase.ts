import { AppealError } from '@api/appeal/errors/AppealError';
import { UserAppealService } from '@api/appeal/services/UserAppealService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { SharedSellOrderService } from '@api/order/services/order/sell';
import { User } from '@api/profile/models/User';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { IParticipantRole, ParticipantRole, addNewMember, createChatRoom } from '@base/utils/chat.utils';
import { RedlockUtil } from '@base/utils/redlock';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class OpenAppealSellOrderUseCase {
  constructor(
    private userAppealService: UserAppealService,
    private orderService: SharedSellOrderService,
    private statisticService: SharedStatisticService,
    private operationManagementService: SharedProfileService
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async openAppealSellOrder(currentUser: User, orderRefId: string): Promise<string> {
    return await RedlockUtil.lock(orderRefId, async () => {
      const order = await this.orderService.getSellOrderByRefIdWithLock(orderRefId);

      if (!order || order.userId !== currentUser.id) {
        return AppealError.ORDER_NOT_FOUND;
      }
      if (!order.isEnableAppeal()) {
        return AppealError.APPEAL_IS_DISABLED;
      }
      let secret = '';
      if (!order.appealId) {
        const merchantManager = await this.operationManagementService.findOneMerchant({
          where: {
            id: order.merchant.merchantManagerId,
          },
        });
        let participants: IParticipantRole[] = [
          {
            userId: merchantManager?.peerChatId,
            role: ParticipantRole.VIEWER,
          },
        ];
        if (!order.roomId) {
          participants = [
            ...participants,
            {
              userId: order.user?.peerChatId,
              role: ParticipantRole.MEMBER,
            },
            {
              userId: order.merchant?.peerChatId,
              role: ParticipantRole.MEMBER,
            },
          ];
          order.roomId = await createChatRoom(orderRefId, participants);
        } else {
          await addNewMember({ roomId: order.roomId, participants });
        }
        const appeal = await this.userAppealService.createAppeal(order);
        secret = appeal.secret;
        await this.orderService.setAppeal(order.id, appeal.id, order.roomId);
        order.appeal = appeal;
        order.appealId = appeal.id;
      } else {
        const merchantManager = await this.operationManagementService.findOneMerchant({
          where: {
            id: order.merchant.merchantManagerId,
          },
        });
        const participants: IParticipantRole[] = [
          {
            userId: merchantManager?.peerChatId,
            role: ParticipantRole.VIEWER,
          },
        ];
        await addNewMember({ roomId: order.roomId, participants });

        const appealUpdatePayload = await this.userAppealService.openAppeal(order.appealId);
        order.appeal.status = appealUpdatePayload.status;
        order.appeal.openAt = appealUpdatePayload.openAt;
        secret = appealUpdatePayload.secret;
      }

      const nextStep = await this.orderService.updateSellOrderToAppealStep(order.id);

      await this.statisticService.updateOrderStatistic(order, nextStep);
      order.step = nextStep;

      await this.userAppealService.emitAppealOrder(order);
      return secret;
    });
  }
}
