import { Service } from 'typedi';
import axios from 'axios';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Order, OrderStatus } from '@api/order/models/Order';
import { TradeType } from '@api/common/models/P2PEnum';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {CrawlBenchmarkPriceType} from '@api/order/types/Order';
import {ApiReferenceExchangeRateResponse, ReferenceExchangeRateRequestBody} from '@api/post/types/Post';
import {env} from '@base/env';
import {Logger, LoggerInterface} from '@base/decorators/Logger';

@Service()
export class BaseOrderService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  public async save(order: Order): Promise<Order | null> {
    return await this.orderRepository.save(order);
  }

  public async update(id: string, partialEntity: QueryDeepPartialEntity<Order>): Promise<number | null> {
    const updateResult = await this.orderRepository.update(id, partialEntity);
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

  public async lockOrderByRefId(id: string): Promise<Order | null> {
    return await this.orderRepository.lockOrderByRefId(id);
  }

  public async getUncompletedById(id: string, type?: TradeType): Promise<Order | null> {
    const status = [OrderStatus.TO_BE_PAID, OrderStatus.CONFIRM_PAID, OrderStatus.PAID];
    return await this.orderRepository.getOneById({
      id,
      status,
      type,
    });
  }

  public async crawlBenchmarkPrice(data: CrawlBenchmarkPriceType): Promise<number> {
    try {
      const body: ReferenceExchangeRateRequestBody = {
        asset: data.assetname,
        fiat: 'VND',
        rows: 1,
        page: 1,
        tradeType: data.tradeType,
        classifies: [
          'mass',
          'profession',
        ],
        proMerchantAds: false,
        shieldMerchantAds: false,
      };
      const response = await axios.post<ApiReferenceExchangeRateResponse>(env.referenceExchangeRate.searchURL, body);
      return Number(response?.data?.data?.[0]?.adv?.price) || 0;
    } catch (error: any) {
      this.log.error(error.message);
      return 0;
    }
  }
}
