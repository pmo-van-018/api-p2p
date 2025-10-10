import { Appeal, BUY_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { DecisionResultRequest } from '@api/appeal/requests/DecisionResultRequest';
import { Operation } from '@api/profile/models/Operation';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { AppealError } from '@api/appeal/errors/AppealError';
import { OperationType, TradeType } from '@api/common/models';
import { events } from '@api/subscribers/events';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { closeAppealMessage } from '@base/utils/chat.utils';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '@api/order/models/Order';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { CRYPTO_PRECISION } from '@api/order/constants/order';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { SharedBuyOrderService } from '@api/order/services/order/buy';
import { Post } from '@api/post/models/Post';
import { RedlockUtil } from '@base/utils/redlock';

@Service()
export class DecideAppealBuyOrderUseCase {
  constructor(
    private adminAppealService: AdminAppealService,
    private orderService: SharedBuyOrderService,
    private postService: SharedPostService,
    private statisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async decideAppeal(currentUser: Operation, decisionResultRequest: DecisionResultRequest) {
    return await RedlockUtil.lock(decisionResultRequest.appealId, async () => {
      const appeal = await this.adminAppealService.getDetailAppeal(decisionResultRequest.appealId);
      if (!appeal || appeal.order?.type !== TradeType.BUY) {
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
      const decisionResult = decisionResultRequest.decisionResult;
      const isViolate = [
        BUY_APPEAL_RESULTS.BUY_EUWIN_FORCE_CLOSE,
        BUY_APPEAL_RESULTS.BUY_EUWIN_CANCEL_MC_VIOLATE,
      ].includes(decisionResult as BUY_APPEAL_RESULTS);
      let isCloseAppeal = true;
      let buyOrderStep = null;
      let updatedOrder = null;

      switch (decisionResult) {
        case BUY_APPEAL_RESULTS.BUY_MCWIN_CANCEL:
        case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED:
        case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_MC_HAS_RETURNED:
        case BUY_APPEAL_RESULTS.BUY_EUWIN_FORCE_CLOSE:
        case BUY_APPEAL_RESULTS.BUY_EUWIN_CANCEL_MC_VIOLATE:
          buyOrderStep = BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM;
          await this.executeCancelBuyOrder(currentUser.id, order, post);
          updatedOrder = {
            status: OrderStatus.CANCELLED,
            cancelByOperationId: currentUser.id,
          };
          break;
        case BUY_APPEAL_RESULTS.BUY_EUWIN_REOPEN:
          buyOrderStep = order.step === BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT
            ? BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME
            : BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED;
          updatedOrder = await this.executeReopenBuyOrder(order, post, buyOrderStep, decisionResultRequest.amount);
          isCloseAppeal = false;
          break;
        default:
          return AppealError.DECISION_RESULT_IS_INVALID;
      }
      await this.statisticService.updateOrderStatistic(order, buyOrderStep);

      if (isViolate) {
        const totalPenaltyFee = new BigNumber(order.penaltyFee).multipliedBy(order.totalPrice).toNumber();
        await this.orderService.setTotalPenaltyFee(order.id, totalPenaltyFee);
        await this.postService.updatePenaltyFeeAmount(post, totalPenaltyFee);
        order.totalPenaltyFee = totalPenaltyFee;
      }

      if (isCloseAppeal) {
        const appealUpdatePayload = {
          ...this.decideWinner(appeal, decisionResult),
          adminId: currentUser.id,
          decisionResult,
          decisionAt: moment.utc().toDate(),
        };
        await this.adminAppealService.closeAppeal(appeal.id, appealUpdatePayload);
        this.eventDispatcher.dispatch(events.actions.appeal.closeAppeal, { appealId: appeal.id });
      } else {
        await this.adminAppealService.updateAppealResult(appeal.id, BUY_APPEAL_RESULTS.BUY_EUWIN_REOPEN);
      }

      order.step = buyOrderStep;
      order.status = updatedOrder.status || order.status;
      order.totalPrice = updatedOrder.totalPrice || order.totalPrice;
      order.amount = updatedOrder.amount || order.amount;
      order.post = post;
      order.appeal = await this.adminAppealService.getAppealById(appeal.id);

      await sendSystemNotification(order);
      if (isCloseAppeal) {
        closeAppealMessage(order.roomId);
      }

      this.eventDispatcher.dispatch([
        events.actions.order.buy.systemFinishOrder,
        this.getEventByDecisionResult(decisionResult),
      ], order);

      return null;
    });
  }

  private getEventByDecisionResult(decisionResult: BUY_APPEAL_RESULTS) {
    switch (decisionResult) {
      case BUY_APPEAL_RESULTS.BUY_MCWIN_CANCEL:
        return events.actions.appeal.resultBuyAppealMerchantWin;
      case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED:
        return events.actions.appeal.closeBuyAppealNotEvident;
      case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_MC_HAS_RETURNED:
        return events.actions.appeal.closeAppealInBuy;
      case BUY_APPEAL_RESULTS.BUY_EUWIN_REOPEN:
        return events.actions.appeal.reopenBuyAppealUserWin;
      case BUY_APPEAL_RESULTS.BUY_EUWIN_FORCE_CLOSE:
      case BUY_APPEAL_RESULTS.BUY_EUWIN_CANCEL_MC_VIOLATE:
        return events.actions.appeal.resultBuyAppealUserWin;
      default:
        return '';
    }
  }

  private async executeReopenBuyOrder(order: Order, post: Post, updateStep: BUY_ORDER_STEPS, totalPrice?: number) {
    const updatedOrder = {
      status: OrderStatus.PAID,
      step: updateStep,
      totalPrice: order.totalPrice,
      amount: order.amount,
    };
    if (totalPrice && totalPrice !== order.totalPrice) {
      const orderAmountRoundedDown = Helper.computeAmountBuyOrder(totalPrice, order.price, CRYPTO_PRECISION);
      const postAmount = new BigNumber(orderAmountRoundedDown).minus(order.requestAmount).abs().toNumber();
      updatedOrder.amount = orderAmountRoundedDown;
      updatedOrder.totalPrice = totalPrice;
      if (new BigNumber(orderAmountRoundedDown).isGreaterThan(order.requestAmount)) {
        await this.postService.changeAmount(post, postAmount);
      } else {
        await this.postService.updateAvailableAmount(post, postAmount);
      }
    }
    await this.orderService.reopenByAdmin(order.id, updatedOrder);
    return updatedOrder;
  }

  private async executeCancelBuyOrder(userId: string, order: Order, post: Post) {
    await this.orderService.cancelOrderByAdmin(order.id, userId);
    await this.postService.updateAvailableAmount(post, order.amount);
  }

  private decideWinner(appeal: Appeal, decisionResult: BUY_APPEAL_RESULTS) {
    const order = appeal.order;
    const appealInfo = {
      operationWinnerId: null,
      userWinnerId: null,
    };
    if ([
      BUY_APPEAL_RESULTS.BUY_EUWIN_FORCE_CLOSE,
      BUY_APPEAL_RESULTS.BUY_EUWIN_CANCEL_MC_VIOLATE,
    ].includes(decisionResult)) {
      appealInfo.userWinnerId = order.userId;
    }

    if (decisionResult === BUY_APPEAL_RESULTS.BUY_MCWIN_CANCEL) {
      appealInfo.operationWinnerId = order.merchantId;
    }
    return appealInfo;
  }
}
