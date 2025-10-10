import { OperationType, PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { MerchantInfoResponse } from '@api/post/responses/Merchant/PostDetailResponse';

export type QueryPostData = {
  limit: number;
  page: number;
  postType?: TradeType;
  type?: TradeType;
  merchantId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string[];
  assetId?: string;
  orderField?: 'amount' | 'id' | 'status' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
};

export type ManagerPostSearchData = {
  limit: number;
  page: number;
  type?: TradeType;
  managerId?: string;
  searchType?: 'WALLET_ADDRESS' | 'NICK_NAME' | 'POST_REFID';
  search?: string;
  status?: string[];
  assetId?: string;
  orderField?: 'availableAmount' | 'finishedAmount' | 'price' | 'status' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
};

export type PostResponseType = {
  postId: string;
  postRefId: string;
  postType: TradeType;
  fiatName: string;
  cryptoName: string;
  cryptoNetwork: string;
  userToMerchantTime: number;
  fixedPriceBeforeFee: number;
  availableAmount: number;
  totalAmount: number;
  finishedAmount: number;
  blockAmount: number;
  price: number;
  lowerFiatLimit: number;
  upperFiatLimit: number;
  totalFee: number;
  totalPenaltyFee: number;
  note?: string;
  feePercent?: number;
  merchant?: MerchantInfoResponse;
};

export type SearchPost = {
  assetName?: string;
  assetNetwork?: string;
  fiat?: string;
  type: TradeType;
  page: number;
  limit: number;
  assetId?: string;
  fiatId?: string;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  merchantId?: string;
  merchantIds?: string[];
  managerId?: string;
  sortDirection?: string;
};

export type PostSearchOptionsType = {
  type: TradeType;
  assetName: string;
  assetNetwork: string;
  fiat: string;
};

export type FindMerchantPost = {
  merchantId: string;
  merchantType: OperationType;
  postStatus?: PostStatus;
  tradeType?: TradeType;
};

export type FindAllPost = {
  postStatus?: PostStatus;
  tradeType?: TradeType;
  paymentMethodIds?: string[];
  postIds?: string[];
  assetIds?: string[];
};

export type FindAllPostByMultiStatus = {
  postStatus?: PostStatus[];
  tradeType?: TradeType;
  paymentMethodIds?: string[];
  postIds?: string[];
};

export type QueryPublicViewPosts = {
  limit: number;
  offset: number;
  postType?: TradeType;
  order?: 'ASC' | 'DESC';
};

// TODO: remove when refactor post module done
export type SavePriceCache = {
  assetId: string;
  postType: string;
  price?: number;
  postId?: string;
};

export type RecommendPriceCache = {
  assetId: string;
  postType: string;
  price?: number;
  postId?: string;
};

export type RecommendPriceByUser = {
  assetName: string;
  assetNetwork: string;
  fiatName: string;
  buyPrice: {
    recommendedPrice: number;
    currentTime: Date;
  },
  sellPrice: {
    recommendedPrice: number;
    currentTime: Date;
  },
};

export type PostConfigurationType = {
  minPostLimit: number;
  maxPostLimit: number;
  minOrderLimit: number;
  availableAmount: number;
  lowerFiatLimit?: number;
  upperFiatLimit?: number;
  maxOrderLimit: number;
  price: number;
  postType?: TradeType; // TODO: remove
  precision: number;
  type: TradeType;
};

export type MerchantRating = {
  merchantId?: string;
  merchantManagerId?: string;
  totalSuccessOrder?: number;
  totalOrder?: number;
};

export type ReferenceExchangeRateRequestBody = {
  fiat: 'VND';
  page?: number;
  rows: number;
  tradeType: TradeType;
  asset: string;
  proMerchantAds: boolean;
  shieldMerchantAds: boolean;
  classifies: string[];
};

type AdvertisementData = {
  adv: Advertisement;
};

export type Advertisement = {
  advNo: string;
  classify: string;
  tradeType: string;
  asset: string;
  fiatUnit: string;
  advStatus: null | string;
  priceType: null | string;
  priceFloatingRatio: null | string;
  rateFloatingRatio: null | string;
  currencyRate: null | string;
  price: string;
  initAmount: null | string;
  surplusAmount: string;
  amountAfterEditing: null | string;
  maxSingleTransAmount: string;
  minSingleTransAmount: string;
  buyerKycLimit: null | string;
  buyerRegDaysLimit: null | string;
  buyerBtcPositionLimit: null | string;
  remarks: null | string;
  autoReplyMsg: string;
  payTimeLimit: number;
  tradeMethods: TradeMethod[];
  userTradeCountFilterTime: null | string;
  userBuyTradeCountMin: null | string;
  userBuyTradeCountMax: null | string;
  userSellTradeCountMin: null | string;
  userSellTradeCountMax: null | string;
  userAllTradeCountMin: null | string;
  userAllTradeCountMax: null | string;
  userTradeCompleteRateFilterTime: null | string;
  userTradeCompleteCountMin: null | string;
  userTradeCompleteRateMin: null | string;
  userTradeVolumeFilterTime: null | string;
  userTradeType: null | string;
  userTradeVolumeMin: null | string;
  userTradeVolumeMax: null | string;
  userTradeVolumeAsset: null | string;
  createTime: null | string;
  advUpdateTime: null | string;
  fiatVo: null | string;
  assetVo: null | string;
  advVisibleRet: null | string;
  takerAdditionalKycRequired: number;
  assetLogo: null | string;
  assetScale: number;
  fiatScale: number;
  priceScale: number;
  fiatSymbol: string;
  isTradable: boolean;
  dynamicMaxSingleTransAmount: string;
  minSingleTransQuantity: string;
  maxSingleTransQuantity: string;
  dynamicMaxSingleTransQuantity: string;
  tradableQuantity: string;
  commissionRate: string;
  takerCommissionRate: null | string;
  tradeMethodCommissionRates: any[];
  launchCountry: null | string;
  abnormalStatusList: null | string[];
  closeReason: null | string;
  storeInformation: null | string;
  allowTradeMerchant: null | string;
};

type TradeMethod = {
  payId: null | string;
  payMethodId: string;
  payType: null | string;
  payAccount: null | string;
  payBank: null | string;
  paySubBank: null | string;
  identifier: string;
  iconUrlColor: null | string;
  tradeMethodName: string;
  tradeMethodShortName: null | string;
  tradeMethodBgColor: string;
};

export type ApiReferenceExchangeRateResponse = {
  code: string;
  message: null | string;
  messageDetail: null | string;
  data: AdvertisementData[];
};
