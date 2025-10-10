import { Service } from 'typedi';

import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { BaseOrderService } from '@api/order/services/order/BaseOrderService';
import {OrderConfiguration, OrderLifecyclePayload} from '@api/order/types/Order';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import sample from 'lodash/sample';
import { DICT, TEXT, TYPE_DICT } from '@base/resources/bank-note';
import { capitalize, generateString } from '@base/utils/p2p.utils';
import { Order } from '@api/order/models/Order';

@Service()
export class BaseOrderLifecycleService extends BaseOrderService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }

  public mergePayload(order: Order, payload: OrderLifecyclePayload) {
    return this.orderRepository.merge(order, payload);
  }

  public getOrderConfiguration(masterDataCommon: MasterDataCommon): OrderConfiguration {
    return {
      cryptoSendingWaitTimeLimit: masterDataCommon.cryptoSendingWaitTimeLimit,
      evidenceProvisionTimeLimit: masterDataCommon.evidenceProvisionTimeLimit,
      merchantToUserTimeBuy: masterDataCommon.merchantToUserTimeBuy,
      merchantToUserTimeSell: masterDataCommon.merchantToUserTimeSell,
      userAskCSTime: masterDataCommon.userAskCSTime,
      userAskMerchantTime: masterDataCommon.userAskMerchantTime,
    };
  }

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
}
