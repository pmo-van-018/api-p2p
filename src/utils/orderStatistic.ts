import { TradeType, UserType, OperationType } from '@api/common/models/P2PEnum';
import { BUY_ORDER_STEPS, Order, SELL_ORDER_STEP } from '@api/order/models/Order';
import { Operator, OperatorAndCount } from '@api/statistic/types/Statistic';
import { orderSumData } from '@api/statistic/types/Volume';
import BigNumber from 'bignumber.js';
import { UserTypeOrOperationType } from '@api/profile/types/User';

export const ORDER_GROUPS = ['waiting', 'waiting_user', 'appeal', 'success', 'cancel'];

export const CANCEL_ORDER_GROUP = 'cancel';
export const BUY_ORDER_GROUPS = {
  [UserType.USER]: {
    WAITING: [
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER,
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ],
    APPEAL: [
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
    ],
    SUCCESS: [BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS],
    CANCEL: [BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM],
  },
  [OperationType.MERCHANT_OPERATOR]: {
    WAITING: [
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ],
    WAITING_USER: [BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME],
    APPEAL: [
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
    ],
    SUCCESS: [BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS],
    CANCEL: [BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM],
  },
  [OperationType.MERCHANT_SUPPORTER]: {
    APPEAL: [
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
      BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ],
  },
  [OperationType.MERCHANT_MANAGER]: {
    WAITING: [
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
      BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
    ],
    WAITING_USER: [BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME],
    APPEAL: [
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
      BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
    ],
    SUCCESS: [BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS],
    CANCEL: [BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM],
  },
};

export const SELL_ORDER_GROUPS = {
  [UserType.USER]: {
    WAITING: [
      SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    ],
    APPEAL: [SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER],
    SUCCESS: [SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER],
    CANCEL: [SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM],
  },
  [OperationType.MERCHANT_OPERATOR]: {
    WAITING: [SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS, SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME],
    WAITING_USER: [
      SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    ],
    APPEAL: [
      SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
    ],
    SUCCESS: [SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER],
    CANCEL: [SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM],
  },
  [OperationType.MERCHANT_SUPPORTER]: {
    APPEAL: [
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
      SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER,
    ],
  },
  [OperationType.MERCHANT_MANAGER]: {
    WAITING: [SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS, SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME],
    WAITING_USER: [
      SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    ],
    APPEAL: [SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER],
    SUCCESS: [SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER],
    CANCEL: [SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM],
  },
};

export const GROUP_STATISTIC_MAPPING = {
  WAITING: 'orderWaitingCount',
  WAITING_USER: 'orderWaitingUserCount',
  APPEAL: 'orderAppealCount',
};

export class OrderStatisticUtil {
  public static getProcessStatistic(userType: UserTypeOrOperationType, order: Order, toStep: BUY_ORDER_STEPS | SELL_ORDER_STEP) {
    const fromStep = order.step;
    const orderType = order.type;
    const orderGroups = orderType === TradeType.BUY ? BUY_ORDER_GROUPS : SELL_ORDER_GROUPS;
    const orderGroupsByUserType = orderGroups[userType];
    const fromGroup = this.getOrderGroupByStep(orderGroupsByUserType, fromStep);
    const toGroup = this.getOrderGroupByStep(orderGroupsByUserType, toStep);
    if (this.isInvalidCancelOrder(order, toStep)) {
      return {
        ...(fromGroup && { [GROUP_STATISTIC_MAPPING[fromGroup]]: '-' as Operator }),
        cancelOrderCount: {
          operator: '+',
          count: 1,
        } as OperatorAndCount,
      };
    }
    return {
      ...(fromGroup !== toGroup && {
        ...(fromGroup && { [GROUP_STATISTIC_MAPPING[fromGroup]]: '-' as Operator }),
        ...(toGroup && { [GROUP_STATISTIC_MAPPING[toGroup]]: '+' as Operator }),
      }),
    };
  }

  public static getTotalStatistic(orderData: orderSumData) {
    const totalOrderCount = new BigNumber(orderData.totalBuyOrder).plus(orderData.totalSellOrder).toNumber();
    return {
      ...(orderData.totalAmount && {
        totalAmountCount: { operator: '+', count: Number(orderData.totalAmount) } as OperatorAndCount,
      }),
      ...(orderData.totalBuyOrder && {
        totalBuyOrderCount: { operator: '+', count: Number(orderData.totalBuyOrder) } as OperatorAndCount,
      }),
      ...(orderData.totalSellOrder && {
        totalSellOrderCount: { operator: '+', count: Number(orderData.totalSellOrder) } as OperatorAndCount,
      }),
      ...(orderData.totalFee && {
        totalFeeCount: { operator: '+', count: Number(orderData.totalFee || 0) } as OperatorAndCount,
      }),
      ...(orderData.totalPenaltyFee && {
        totalPenaltyFeeCount: { operator: '+', count: Number(orderData.totalPenaltyFee || 0) } as OperatorAndCount,
      }),
      ...(totalOrderCount && { totalOrderCount: { operator: '+', count: totalOrderCount } as OperatorAndCount }),
      ...(orderData.totalSuccessOrder && {
        ...{ orderCompletedCount: { operator: '+', count: Number(orderData.totalSuccessOrder) } as OperatorAndCount },
        ...{
          monthOrderCompletedCount: { operator: '+', count: Number(orderData.totalSuccessOrder) } as OperatorAndCount,
        },
      }),
      ...(orderData.averageCancelledTime && {
        averageCancelledTime: { operator: '+', count: Number(orderData.averageCancelledTime || 0) } as OperatorAndCount,
      }),
      ...(orderData.averageCompletedTime && {
        averageCompletedTime: { operator: '+', count: Number(orderData.averageCompletedTime || 0) } as OperatorAndCount,
      }),
    };
  }

  public static getOrderStepsByGroup(userType: UserType | OperationType, group: string) {
    return {
      [TradeType.BUY]: BUY_ORDER_GROUPS[userType][String(group).toUpperCase()],
      [TradeType.SELL]: SELL_ORDER_GROUPS[userType][String(group).toUpperCase()],
    };
  }

  protected static isCancelOrder(order: Order, toStep: BUY_ORDER_STEPS | SELL_ORDER_STEP) {
    const buyCompleteSteps = [
      BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM,
      BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER,
    ];
    const sellCompleteSteps = [
      SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM,
      SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER,
    ];
    return (
      (order.type === TradeType.BUY && buyCompleteSteps.includes(toStep as BUY_ORDER_STEPS)) ||
      (order.type === TradeType.SELL && sellCompleteSteps.includes(toStep as SELL_ORDER_STEP))
    );
  }

  // tslint:disable-next-line:member-ordering
  public static isCancelOrderByAppeal(order: Order) {
    return (order?.appeal?.adminId && (
      (order.type === TradeType.BUY && order.step === BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM) ||
      (order.type === TradeType.SELL && order.step === SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM)
    ));
  }

  protected static isInvalidCancelOrder(order: Order, toStep: BUY_ORDER_STEPS | SELL_ORDER_STEP) {
    return this.isCancelOrder(order, toStep) && !order.appeal?.adminId;
  }

  // tslint:disable-next-line:member-ordering
  public static getOrderGroupByStep(orderGroupsByUserType: any, step: BUY_ORDER_STEPS | SELL_ORDER_STEP): string {
    for (const [key, value] of Object.entries(orderGroupsByUserType)) {
      if ((value as number[]).includes(step)) {
        return key;
      }
    }
    return '';
  }
}
