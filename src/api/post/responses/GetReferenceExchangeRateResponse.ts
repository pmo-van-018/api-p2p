import { Advertisement } from "../types/Post";

class referenceExchangeRateInfo {
  public price: number;
  public lowerFiatLimit: number;
  public upperFiatLimit: number;
  public availableAmount: number;

  constructor(data: Advertisement) {
    this.price = Number(data.price);
    this.lowerFiatLimit = Number(data.minSingleTransAmount);
    this.upperFiatLimit = data.dynamicMaxSingleTransAmount ? Number(data.dynamicMaxSingleTransAmount) : Number(data.maxSingleTransAmount);
    this.availableAmount = Number(data.tradableQuantity);
  }
}

export class GetReferenceExchangeRateResponse {
  public referenceExchangeRateInfo: referenceExchangeRateInfo;

  constructor(data: Advertisement) {
    this.referenceExchangeRateInfo = data ? new referenceExchangeRateInfo(data): null;
  }
}
