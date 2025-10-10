import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import {BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP} from '@api/order/models/Order';
import { TradeType } from '@api/common/models/P2PEnum';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseOrderLifecycleService } from '@api/order/services/order/BaseOrderLifecycleService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { OrderSellCreateRequest } from '@api/order/requests/OrderSellCreateRequest';
import { OrderData, UserQueryOrder } from '@api/order/types/Order';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { CRYPTO_PRECISION } from '@api/order/constants/order';
import moment from 'moment';
import { generateRefId } from '@base/utils/helper.utils';
import BigNumber from 'bignumber.js';
import { IsNull } from 'typeorm';
import { OrderCreateRequest } from '@api/order/requests/OrderCreateRequest';
import {Post} from '@api/post/models/Post';
import {ErrorInfo} from '@api/infrastructure/helpers/ErrorInfo';
import {getCurrentNetWorkUsedWalletAddress, isUnSupportedNetwork} from '@base/utils/unsupported-network.utils';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {PostError} from '@api/post/errors/PostError';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@Service()
export class UserOrderLifecycleService extends BaseOrderLifecycleService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }

  public async save(order: Order): Promise<Order | null> {
    return await this.orderRepository.save(order);
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<Order>): Promise<number | null> {
    const updateResult = await this.orderRepository.update(id, partialEntity);
    return updateResult.affected;
  }

  public async updateRoomId(id: string, roomId: string): Promise<number | null> {
    const updateResult = await this.orderRepository.update({ id, roomId: IsNull() }, { roomId });
    return updateResult.affected;
  }

  public async updateAppealId(id: string, appealId: string): Promise<number | null> {
    const updateResult = await this.orderRepository.update({ id, appealId: IsNull() }, { appealId });
    return updateResult.affected;
  }

  public remove(order: Order) {
    this.orderRepository.remove(order);
  }

  public async getFullInfoByRefId(refId: string): Promise<Order | null> {
    return await this.orderRepository.getOneByRefId(refId);
  }

  public async isUserPendingOrder(userId: string): Promise<boolean> {
    const order = await this.orderRepository.getPendingOrderByUserId(userId);
    return !!order;
  }

  public async getUncompletedById(id: string, type?: TradeType): Promise<Order | null> {
    const status = [OrderStatus.TO_BE_PAID, OrderStatus.CONFIRM_PAID, OrderStatus.PAID];
    return await this.orderRepository.getOneById({
      id,
      status,
      type,
    });
  }

  public async createSellOrder(orderRequest: OrderSellCreateRequest, data: OrderData): Promise<Order | null> {
    this.log.debug('Start implement createSellOrder method for: ', JSON.stringify(orderRequest));
    const order = new Order();
    order.userId = data.userId;
    order.assetId = data.assetId;
    order.fiatId = data.fiatId;
    order.amount = Helper.computeAmountSellOrder(orderRequest.totalPrice, orderRequest.price, CRYPTO_PRECISION);
    order.totalPrice = orderRequest.totalPrice;
    order.requestTotalPrice = orderRequest.totalPrice;
    order.requestAmount = order.amount;
    order.price = orderRequest.price;
    order.postId = data.postId;
    order.merchantId = data.merchantId;
    order.status = OrderStatus.TO_BE_PAID;
    order.step = SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER;
    order.createdTime = moment.utc().toDate();
    order.fee = data.fee;
    order.penaltyFee = data.penaltyFee;
    order.endedTime = moment(order.createdTime).add(data.paymentTimeLimit, 'minutes').toDate();
    order.paymentMethodId = orderRequest.paymentMethodId;
    order.type = TradeType.SELL;
    order.transCode = this.generateTransCode();
    order.refId = generateRefId();
    order.configuration = data.configuration;
    order.benchmarkPercent = data.benchmarkPercent;
    order.benchmarkPrice = data.benchmarkPrice;
    order.benchmarkPriceAtCreated = data.benchmarkPriceAtCreated;
    order.id = (await this.orderRepository.insert(order)).identifiers[0]['id'];
    return order;
  }

  public async createBuyOrder(orderRequest: OrderCreateRequest, data: OrderData): Promise<Order | null> {
    const order = new Order();
    order.userId = data.userId;
    order.assetId = data.assetId;
    order.fiatId = data.fiatId;
    order.amount = Helper.computeAmountBuyOrder(orderRequest.totalPrice, orderRequest.price, CRYPTO_PRECISION);
    order.totalPrice = orderRequest.totalPrice;
    order.requestTotalPrice = orderRequest.totalPrice;
    order.requestAmount = order.amount;
    order.price = orderRequest.price;
    order.postId = data.postId;
    order.merchantId = data.merchantId;
    order.status = OrderStatus.TO_BE_PAID;
    order.step = BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER;
    order.createdTime = moment.utc().toDate();
    order.fee = data.fee;
    order.penaltyFee = data.penaltyFee;
    order.endedTime = moment(order.createdTime).add(data.paymentTimeLimit, 'minutes').toDate();
    order.paymentMethodId = data.paymentMethodId;
    order.type = TradeType.BUY;
    order.transCode = this.generateTransCode();
    order.refId = generateRefId();
    order.configuration = data.configuration;
    order.benchmarkPrice = data.benchmarkPrice;
    order.benchmarkPercent = data.benchmarkPercent;
    order.benchmarkPriceAtCreated = data.benchmarkPriceAtCreated;
    order.id = (await this.orderRepository.insert(order)).identifiers[0]['id'];
    return order;
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

  public validateOrderRequest(orderRequest: OrderCreateRequest, post: Post, walletAddress: string): ErrorInfo | null {
    const currentNetwork = getCurrentNetWorkUsedWalletAddress(walletAddress);
    if (isUnSupportedNetwork(currentNetwork, post.asset.network)) {
      return OrderLifeCycleError.NETWORK_NOT_SUPPORTED;
    }
    const amount = Helper.computeAmountBuyOrder(orderRequest.totalPrice, orderRequest.price, CRYPTO_PRECISION);
    if (!post) {
      return PostError.MERCHANT_BUY_POST_IS_UNAVAILABLE;
    }
    if (post.hasRealPriceNotEqualTo(orderRequest.price)) {
      return OrderLifeCycleError.PRICE_IS_INVALID;
    }
    if (post.hasAmountAvailableLessThan(amount)) {
      return OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_AVAILABLE_AMOUNT;
    }
    if (post.hasMinOrderAmountGreaterThan(orderRequest.totalPrice)) {
      return OrderLifeCycleError.AMOUNT_IS_LESS_THAN_POST_MIN_AMOUNT;
    }
    if (post.hasMaxOrderAmountLessThan(orderRequest.totalPrice)) {
      return OrderLifeCycleError.AMOUNT_IS_GREATER_THAN_POST_MAX_AMOUNT;
    }
    return null;
  }

  public async getOrders(query: UserQueryOrder) {
    return await this.orderRepository.getUserOrders(query);
  }

  public async getListTransactionFailed(request: PaginationQueryRequest) {
    return await this.orderRepository.getListTransactionFailed(request)
  }

  public async getFullSellOrdeByRefId(refId: string, userId?: string): Promise<Order | null> {
    return await this.orderRepository.getSellOrderByRefId(refId, userId);
  }

  public async countTotalTransactionConfirmation(): Promise<number> {
    return await this.orderRepository.countTotalTransactionConfirmation();
  }

  public validateOrderBeforeConfirmTransaction(order: Order, currentUser: User | Operation) {
    if (order.status !== OrderStatus.TO_BE_PAID) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }
    if (order.step !== SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER) {
      return OrderLifeCycleError.ORDER_STEP_IS_INVALID;
    }
    // Allways room id is required for user request transaction confirmation
    if (order.userId === currentUser.id && order.roomId) {
      return OrderLifeCycleError.ORDER_ROOM_ID_ALREADY_EXIST;
    }
    // Room id is required for admin confirm transaction
    if (order.userId !== currentUser.id && !order.roomId) {
      return OrderLifeCycleError.ORDER_ROOM_ID_IS_INVALID;
    }
    return null;
  }
}
