import { Service } from 'typedi';
import { OrderStatus } from '@api/order/models/Order';
import {TradeType, OperationType, UserType} from '@api/common/models/P2PEnum';
import {In, IsNull} from 'typeorm';
import {OrderRequestType} from '@api/order/types/Order';
import {Helper} from '@api/infrastructure/helpers/Helper';
import {DateFormat} from '@api/infrastructure/helpers/DateFormat';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {OrderRepository} from '@api/order/repositories/OrderRepository';

@Service()
export class MerchantOrderManagementService {
  constructor(
    @InjectRepository() private orderRepository: OrderRepository
  ) {}

  public async findAll<
    O extends OrderRequestType & {
      merchantType?: UserType | OperationType;
    } & { currentType?: UserType | OperationType }
  >(orderRequestType: O) {
    const {
      orderStatus,
      orderStep,
      startDate,
      endDate,
      orderDirection,
      orderField,
      type,
      assetType,
      limit,
      amount,
      totalPrice,
      page,
      search,
      merchantId,
      merchantType,
      userId,
      postId,
      hasAppeal,
      canceledByAdmin,
      readonly,
      appealStatus,
      sort,
      orderGroupStep,
      hasHistoriesOrder,
      searchField,
      searchValue,
      supporterId,
      adminSupporterId,
    } = orderRequestType;
    const status = Helper.normalizeStringToArray(orderStatus, ',');
    const step = Helper.normalizeStringToArray(orderStep, ',');
    const startDateFormat = DateFormat.formatStartDate(startDate);
    const endDateFormat = DateFormat.formatEndDate(endDate);
    return await this.orderRepository.getAndCountOrders({
      page,
      limit,
      status,
      step,
      orderDirection,
      orderField,
      merchantId,
      merchantType,
      userId,
      postId,
      search,
      tradeType: type,
      assetType,
      startDate: startDateFormat,
      endDate: endDateFormat,
      amount,
      totalPrice,
      hasAppeal,
      canceledByAdmin,
      readonly,
      appealStatus: Helper.normalizeStringToArray(appealStatus, ','),
      sort: Helper.normalizeStringToSortObjectArray(sort, 'ASC'),
      orderGroupStep,
      hasHistoriesOrder,
      searchField,
      searchValue,
      supporterId,
      adminSupporterId,
    });
  }

  public countPickedOrder(supporterId: string) {
    return this.orderRepository.count({
      where: {
        supporterId,
        appealResolved: IsNull(),
        status: In([OrderStatus.TO_BE_PAID, OrderStatus.PAID, OrderStatus.CONFIRM_PAID]),
      },
    });
  }

  public async getOrderPriceStatisticByPeriod(from: string, to: string, type: TradeType, managerId: string) {
    const orderType = this.reverseTradeType(type);
    return this.orderRepository.getOrderPriceStatisticByPeriod(from, to, orderType, managerId);
  }

  private reverseTradeType(tradeType: TradeType) {
    return tradeType === TradeType.BUY ? TradeType.SELL : TradeType.BUY;
  }
}
