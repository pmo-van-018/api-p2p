import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { ApiReferenceExchangeRateResponse, ReferenceExchangeRateRequestBody } from '@api/post/types/Post';
import { GetReferenceExchangeRateRequest } from '@api/post/requests/GetReferenceExchangeRateRequest';
import { env } from '@base/env';
import axios from 'axios';
import { TradeType } from '@api/common/models';

const SEARCH_EXCHANGE_RATE_MAX_PAGE = 5;

@Service()
export class GetReferenceExchangeRateUseCase {
  constructor(
    @Logger(__filename) private log: LoggerInterface
  ) {}
  public async getExchangeRate(getReferenceExchangeRateRequest: GetReferenceExchangeRateRequest) {
    this.log.debug(
      `Start implement getExchangeRate method for ${getReferenceExchangeRateRequest.assetName} width min: ${getReferenceExchangeRateRequest.lowerFiatLimit}`
    );
    const { assetName, postType, lowerFiatLimit } = getReferenceExchangeRateRequest;
    const body: ReferenceExchangeRateRequestBody = {
      asset: assetName,
      fiat: 'VND',
      rows: 20,
      tradeType: postType === TradeType.BUY ? TradeType.SELL : TradeType.BUY,
      classifies: [
        'mass',
        'profession',
      ],
      proMerchantAds: false,
      shieldMerchantAds: false,
    };
    for (let i = 1; i <= SEARCH_EXCHANGE_RATE_MAX_PAGE; i++) {
      body.page = i;
      const adv = await this.searchReferenceExchangeRateRequest(body, lowerFiatLimit);
      if (adv) {
        return adv;
      }
    }
    return null;
  }

  private async searchReferenceExchangeRateRequest(body: ReferenceExchangeRateRequestBody, minAmount: number) {
    try {
      const response = await axios.post<ApiReferenceExchangeRateResponse>(env.referenceExchangeRate.searchURL, body);
      if (response?.data?.data?.length) {
        const result = response.data.data.find((item) =>
          Number(item.adv?.minSingleTransAmount) === minAmount);
        return result?.adv;
      }
      return null;
    } catch (error: any) {
      this.log.error(`[${this.searchReferenceExchangeRateRequest.name}] failed: ${error.message ?? error}`);
      return null;
    }
  }
}
