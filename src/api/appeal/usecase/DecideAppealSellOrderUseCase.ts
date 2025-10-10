import { AppealError } from '@api/appeal/errors/AppealError';
import { SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { DecisionResultRequest } from '@api/appeal/requests/DecisionResultRequest';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { CloseAppeal } from '@api/appeal/types/Appeal';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { OperationType, TradeType } from '@api/common/models';
import { Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { SharedSellOrderService } from '@api/order/services/order/sell';
import { OrderOutBoxService } from '@api/outbox/services/OrderOutBoxService';
import { Post } from '@api/post/models/Post';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { Operation } from '@api/profile/models/Operation';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { closeAppealMessage } from '@base/utils/chat.utils';
import { RedlockUtil } from '@base/utils/redlock';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class DecideAppealSellOrderUseCase {
  constructor(
    private adminAppealService: AdminAppealService,
    private orderService: SharedSellOrderService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    private readonly orderOutBoxService: OrderOutBoxService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async decideAppeal(currentUser: Operation, decisionResultRequest: DecisionResultRequest) {
    return await RedlockUtil.lock(decisionResultRequest.appealId, async () => {
      const appeal = await this.adminAppealService.getDetailAppeal(decisionResultRequest.appealId);
      if (!appeal || appeal.order?.type !== TradeType.SELL) {
        return AppealError.APPEAL_NOT_FOUND;
      }
      if (!appeal.isOpenAppeal()) {
        return AppealError.APPEAL_STATUS_IS_INVALID;
      }
      if (appeal.adminId && appeal.adminId !== currentUser.id && currentUser.type === OperationType.ADMIN_SUPPORTER) {
        return AppealError.PERMISSION_DENIED_TO_UPDATE_APPEAL;
      }

      const post = await this.postService.getPostByIdWithLock(appeal.order.postId);

      const order = appeal.order;
      const isViolate = decisionResultRequest.decisionResult === SELL_APPEAL_RESULTS.SELL_EUWIN_CANCEL_MC_VIOLATE;
      const closeAppealPayload: CloseAppeal = {
        adminId: currentUser.id,
        decisionResult: decisionResultRequest.decisionResult,
        decisionAt: moment.utc().toDate(),
      };

      let totalFee = 0;
      let sellOrderStep = null;
      let sellOrderStatus = order.status;
      switch (decisionResultRequest.decisionResult) {
        case SELL_APPEAL_RESULTS.SELL_MCWIN_SUCCESS:
          totalFee = await this.executeFinishSellOrder(order, post);
          closeAppealPayload.operationWinnerId = appeal.order.merchantId;
          sellOrderStep = SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER;
          sellOrderStatus = OrderStatus.COMPLETED;
          break;
        case SELL_APPEAL_RESULTS.SELL_NOWIN_CANCEL_MC_HAS_RETURNED:
        case SELL_APPEAL_RESULTS.SELL_EUWIN_CANCEL_MC_VIOLATE:
          await this.executeCancelSellOrder(currentUser.id, order, post);
          closeAppealPayload.userWinnerId = isViolate ? order.userId : null;
          sellOrderStep = SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM;
          sellOrderStatus = OrderStatus.CANCELLED;
          break;
        default:
          return AppealError.DECISION_RESULT_IS_INVALID;
      }
      await this.statisticService.updateOrderStatistic(order, sellOrderStep);
      await this.adminAppealService.closeAppeal(appeal.id, closeAppealPayload);

      if (isViolate) {
        const totalPenaltyFee = new BigNumber(order.penaltyFee).multipliedBy(order.totalPrice).toNumber();
        await this.orderService.setTotalPenaltyFee(order.id, totalPenaltyFee);
        await this.postService.updatePenaltyFeeAmount(post, totalPenaltyFee);
        order.totalPenaltyFee = totalPenaltyFee;
      }

      order.totalFee = totalFee;
      order.step = sellOrderStep;
      order.status = sellOrderStatus;
      order.post = post;
      order.appeal = await this.adminAppealService.getAppealById(appeal.id);

      await sendSystemNotification(order);
      closeAppealMessage(order.roomId);
      await this.orderOutBoxService.publishCompletedOrderEvent(order);
      this.eventDispatcher.dispatch(
        [
          events.actions.order.sell.systemFinishOrder,
          events.actions.appeal.closeAppeal,
          this.getEventByDecisionResult(decisionResultRequest.decisionResult),
        ],
        order
      );
      return null;
    });
  }

  private getEventByDecisionResult(decisionResult: SELL_APPEAL_RESULTS) {
    switch (decisionResult) {
      case SELL_APPEAL_RESULTS.SELL_MCWIN_SUCCESS:
        return events.actions.appeal.resultSellAppealMerchantWin;
      case SELL_APPEAL_RESULTS.SELL_NOWIN_CANCEL_MC_HAS_RETURNED:
        return events.actions.appeal.closeSellAppeal;
      case SELL_APPEAL_RESULTS.SELL_EUWIN_CANCEL_MC_VIOLATE:
        return events.actions.appeal.resultSellAppealUserWin;
      default:
        return '';
    }
  }

  private async executeFinishSellOrder(order: Order, post: Post) {
    const totalFee = this.orderService.calculateTotalFeeSellOrder(order);
    await this.orderService.finishOrderByAdmin(order.id, totalFee);
    const result = await this.postService.updateFinishedAmountAndFee(post, order.amount, totalFee);
    if (result.isFullFill) {
      await this.statisticService.updatePostCount(order.merchantId, false);
    }
    return totalFee;
  }

  private async executeCancelSellOrder(userId: string, order: Order, post: Post) {
    await this.orderService.cancelOrderByAdmin(order.id, userId);
    await this.postService.updateAvailableAmount(post, order.amount);
  }
}
