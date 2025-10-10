import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderListRequest} from '@api/order/requests/MerchantOrderListRequest';
import {OperationType, TradeType} from '@api/common/models';
import {CANCEL_ORDER_GROUP, OrderStatisticUtil} from '@base/utils/orderStatistic';
import {MerchantOrderManagementService} from '@api/order/services/order/MerchantOrderManagementService';

@Service()
export class GetListOrderUseCase {
  constructor(
    private merchantOrderManagementService: MerchantOrderManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOrders(currentUser: Operation, merchantOrderListRequest: MerchantOrderListRequest) {
    this.log.debug('Start implement merchantGetListOrderUseCase method for: ', currentUser.type, currentUser.walletAddress);
    const typePostReversed = merchantOrderListRequest.type
      ? merchantOrderListRequest.type === TradeType.BUY
        ? TradeType.SELL
        : TradeType.BUY
      : null;
    const orderGroupStep = merchantOrderListRequest.orderGroup
      ? OrderStatisticUtil.getOrderStepsByGroup(currentUser.type, merchantOrderListRequest.orderGroup)
      : undefined;
    const [ items, totalItems ] = await this.merchantOrderManagementService.findAll({
      ...merchantOrderListRequest,
      type: typePostReversed,
      merchantId: merchantOrderListRequest.merchantId ? merchantOrderListRequest.merchantId : currentUser.id,
      merchantType: merchantOrderListRequest.merchantId ? OperationType.MERCHANT_OPERATOR : currentUser.type,
      orderGroupStep,
      ...(CANCEL_ORDER_GROUP === merchantOrderListRequest.orderGroup && { hasAppeal: true, canceledByAdmin: true }),
    });
    this.log.debug('Stop implement merchantGetListOrderUseCase method for: ', currentUser.type, currentUser.walletAddress);
    return { items, totalItems };
  }
}
