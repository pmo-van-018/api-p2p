/* eslint-disable no-async-promise-executor */
import BigNumber from 'bignumber.js';
import moment from 'moment';
import Container, { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { P2PError } from '@api/common/errors/P2PError';
import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { TradeType, OperationType } from '@api/common/models/P2PEnum';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { OrderError } from '@api/order/errors/OrderError';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import {
  FindOrderViaUserType,
  GetOrderRequestType,
} from '@api/order/types/Order';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { DICT, TEXT, TYPE_DICT } from '@base/resources/bank-note';
import { capitalize, generateString } from '@base/utils/p2p.utils';
import sample from 'lodash/sample';
import { FindConditions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { ReferralService } from '@api/referral/services/ReferralService';
import { ErrorInfo } from '@api/infrastructure/helpers/ErrorInfo';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import {BaseOrderService} from '@api/order/services/order/BaseOrderService';

@Service()
export class SystemOrderLifecycleService extends BaseOrderService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    protected referralService: ReferralService,
    @Logger(__filename) protected log: LoggerInterface,
    protected masterDataService: SharedMasterDataService
  ) {
    super(orderRepository, log);
  }

  public async save(order: Order): Promise<Order | null> {
    return await this.orderRepository.save(order);
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<Order>): Promise<number | null> {
    try {
      const updateResult = await this.orderRepository.update(id, partialEntity);
      return updateResult.affected;
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw error;
    }
  }

  public remove(order: Order) {
    this.orderRepository.remove(order);
  }

  public validateOrder(order: Order, user: User): ErrorInfo | null {
    if (!order) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.userId !== user.id) {
      return OrderLifeCycleError.APPEAL_PERMISSION_DENIED;
    }
    if (!order.isEnableAppeal()) {
      return OrderLifeCycleError.APPEAL_IS_DISABLED;
    }
    return null;
  }

  public async getFullInfoById(requestGetOrder: GetOrderRequestType): Promise<Order | null> {
    return await this.orderRepository.getOneById(requestGetOrder);
  }

  public async isUserPendingOrder(userId: string): Promise<boolean> {
    const order = await this.orderRepository.getPendingOrderByUserId(userId);
    return !!order;
  }

  public getCountdownSellOrderList(): Promise<Order[]> {
    try {
      const steps = [
        SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
        SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
        SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
        SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
      ];
      return this.orderRepository.getCountdownOrderList(steps, TradeType.SELL);
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async updateSendingCryptoSuccess(order: Order): Promise<number> {
    try {
      let updateResult;
      const benchmarkPrice = await this.crawlBenchmarkPrice({
        assetname: order.asset.name,
        tradeType: order.type,
      });
      if (order.type === TradeType.BUY) {
        updateResult = await this.orderRepository.update(order.id, {
          status: OrderStatus.COMPLETED,
          step: BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS,
          completedTime: moment.utc().toDate(),
          totalFee: this.calculateTotalFee(order),
          benchmarkPriceAtSent: benchmarkPrice,
        });
        this.referralService.handleReferralOrderCompleted(order.userId, order.id);
        if (order.appealId) {
          const appealService = Container.get<SharedAppealService>(SharedAppealService);
          await sendSystemNotification(order);
          await appealService.closeBySystem(order.appealId);
        }
      } else {
        const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
        updateResult = await this.orderRepository.update(order.id, {
          status: OrderStatus.PAID,
          step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS,
          endedTime: moment.utc().add(masterDataCommon.merchantToUserTimeBuy, 'minutes').toDate(),
          benchmarkPriceAtSent: benchmarkPrice,
        });
      }
      return updateResult?.affected;
    } catch (error: any) {
      this.log.error(error.message);
    }
    return 0;
  }

  // tslint:disable-next-line:typedef
  public async updateSendingCryptoFailed(order: Order, extraTimeoutInSecond = 0): Promise<number> {
    try {
      let updateResult;
      if (order.type === TradeType.BUY) {
        updateResult = await this.orderRepository.update(order.id, {
          status: OrderStatus.PAID,
          step: BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
        });
      } else {
        updateResult = await this.orderRepository.update(order.id, {
          status: OrderStatus.TO_BE_PAID,
          step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
          endedTime: moment(order.endedTime).add(extraTimeoutInSecond, 'second').utc().toDate(),
        });
      }

      return updateResult?.affected;
    } catch (error: any) {
      throw new Error(`[${this.updateSendingCryptoFailed.name}] failed: ${error.message ?? error}`);
    }
  }

  public async cancelSellOrderSendCryptoFailed(order: Order): Promise<number> {
    try {
      const updateResult = await this.orderRepository.update(order.id, {
        status: OrderStatus.CANCELLED,
        step: SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM,
        completedTime: moment.utc().toDate(),
        paymentMethodId: null,
      });

      return updateResult?.affected;
    } catch (error: any) {
      throw new Error(`[${this.cancelSellOrderSendCryptoFailed.name}] failed: ${error.message ?? error}`);
    }
  }

  public async findOneWithConditions(
    conditions?: FindConditions<Order>,
    options?: FindOneOptions<Order>
  ): Promise<Order | null> {
    return await this.orderRepository.findOne(conditions, options);
  }

  public async getOneWithFullInfoByAppealId(appealId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.getOneByAppealId(appealId);
    } catch (error: any) {
      this.log.error(error.message ?? error);
    }
    return null;
  }

  public async countMerchantOrders(merchantId: string, merchantType: OperationType) {
    const finishStatus = [OrderStatus.CANCELLED, OrderStatus.COMPLETED];
    const pendingStatus = [OrderStatus.TO_BE_PAID, OrderStatus.CONFIRM_PAID, OrderStatus.PAID];
    const completeOrder = await this.orderRepository.countByMerchantAndStatus(merchantId, merchantType, finishStatus);
    const pendingOrder = await this.orderRepository.countByMerchantAndStatus(merchantId, merchantType, pendingStatus);
    return { completeOrder, pendingOrder };
  }

  public calculateTotalFee(order: Order): number {
    let totalFee = 0;
    if (order.type === TradeType.BUY) {
      totalFee = new BigNumber(order.amount)
        .multipliedBy(order.price)
        .multipliedBy(order.fee)
        .dividedBy(new BigNumber(1).plus(order.fee))
        .toNumber();
    }
    if (order.type === TradeType.SELL) {
      totalFee = new BigNumber(order.amount).multipliedBy(order.price).multipliedBy(order.fee).toNumber();
    }
    totalFee = Math.ceil(totalFee);
    return totalFee;
  }

  public async checkErrorAndReturnOrder(
    user: Operation | User,
    id: string,
    type?: TradeType,
    viewOnly?: boolean
  ): Promise<Order> {
    this.log.debug('Start implement checkErrorAndReturnOrder method for: ', user.type, user.walletAddress);
    let order: Order;
    try {
      order = await this.getFullInfoById({
        id,
        user,
        type,
        viewOnly,
      });
    } catch (error) {
      throw new P2PError(OrderError.GET_ORDER_DETAIL_FAIL);
    }
    if (!order) {
      throw new P2PError(OrderError.ORDER_NOT_FOUND);
    }
    this.log.debug('Stop implement checkErrorAndReturnOrder method for: ', user.type, user.walletAddress);
    return order;
  }

  /**
   * Generate a transCode value
   *
   * @returns {string} The transCode value
   */
  public generateTransCode(): string {
    // Generate some random items from the dictionary resources
    const typeDict = sample(Object.values(TYPE_DICT));
    const originalDict = sample(DICT);
    const text = sample(TEXT);
    const randomString = generateString(6);

    // Convert "dict" before using
    let dict = originalDict;
    switch (typeDict) {
      case TYPE_DICT.CAPITALIZED_CASE:
        dict = capitalize(originalDict);
        break;

      case TYPE_DICT.UPPER_CASE:
        dict = originalDict?.toUpperCase();
        break;

      case TYPE_DICT.LOWER_CASE:
      default:
        break;
    }

    // Generate a transCode value from the random items
    const result = `${dict} ${text} ${randomString}`;

    return result;
  }

  public async statisticRecentOrders(options: FindOrderViaUserType) {
    return await this.orderRepository.statisticRecentOrders(options);
  }

  public async unlinkSupporterIdFromAppealingOrder(supporterId: string): Promise<{ affected: number }> {
    const result = await this.orderRepository.update({ supporterId }, { supporterId: null });
    return { affected: result.affected };
  }

  public async getOrderConfigurationOrMasterData(order: Order) {
    return order.configuration ?? this.masterDataService.getLatestMasterDataCommon();
  }
}
