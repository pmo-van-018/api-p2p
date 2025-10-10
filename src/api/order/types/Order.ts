import { FileFormat, ReportType, StaffType, TradeType } from '@api/common/models/P2PEnum';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { BUY_ORDER_STEPS, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import {SortInput, SortOrder} from '@api/common/types/Common';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

export type OrderConfiguration = Pick<
MasterDataCommon,
| 'cryptoSendingWaitTimeLimit'
| 'evidenceProvisionTimeLimit'
| 'merchantToUserTimeBuy'
| 'merchantToUserTimeSell'
| 'userAskCSTime'
| 'userAskMerchantTime'
>;

export type OrderLifecyclePayload = {
  status?: OrderStatus,
  cancelByUserId?: string;
  step?: BUY_ORDER_STEPS | SELL_ORDER_STEP;
  completedTime?: Date;
  totalFee?: number;
  endedTime?: Date;
};

export type OrderData = {
  assetId: string;
  fiatId: string;
  postId: string;
  merchantId: string;
  paymentTimeLimit: number;
  userId: string;
  fee?: number;
  penaltyFee?: number;
  paymentMethodId?: string;
  assetPrecision?: number;
  userPeerChatId?: string;
  merchantPeerChatId?: string;
  configuration: OrderConfiguration;
  benchmarkPrice?: number;
  benchmarkPercent?: number;
  benchmarkPriceAtCreated?: number;
};

export type QueryOrderData = {
  limit: number;
  page: number;
  tradeType?: string;
  assetType?: string;
  userId?: string;
  merchantId?: string;
  postId?: string;
  search?: string;
  searchField?: string;
  searchValue?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  status?: string[];
  step?: string[];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
  hasAppeal?: boolean;
  canceledByAdmin?: boolean;
  hasHistoriesOrder?: boolean;
  readonly?: boolean;
  appealStatus?: string[];
  orderGroupStep?: orderGroupStepType;
  totalPrice?: number;
  supporterId?: string;
  adminSupporterId?: string;
} & SortInput;

export type UserQueryOrder = {
  page: number,
  limit: number,
  userId: string,
  startDate: string,
  endDate: string,
  type?: TradeType,
  assetId?: string,
  status?: string[],
  searchField?: string,
  searchValue?: string,
  orderField?: string,
  orderDirection?: 'ASC' | 'DESC',
  sort?: Record<string, SortOrder>[],
  hasAppeal?: boolean,
};

export type GetOrderRequestType = {
  id: string;
  user?: User | Operation;
  type?: TradeType;
  status?: OrderStatus[];
  hasAppeal?: boolean;
  viewOnly?: boolean;
  searchByRefId?: boolean;
};

export type orderGroupStepType = {
  BUY: number[];
  SELL: number[];
};

export type OrderRequestType = {
  orderStatus: string;
  orderStep?: string;
  page: number;
  limit: number;
  type?: string;
  assetType?: string;
  search?: string;
  searchField?: string;
  searchValue?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  merchantId?: string;
  postId?: string;
  orderDirection?: 'ASC' | 'DESC';
  orderField?: string;
  amount?: number;
  hasAppeal?: boolean;
  canceledByAdmin?: boolean;
  hasHistoriesOrder?: boolean;
  appealStatus?: string;
  sort?: string;
  orderGroupStep?: orderGroupStepType;
  readonly?: boolean;
  totalPrice?: number;
  supporterId?: string;
  adminSupporterId?: string;
};

export type FindOrderViaUserType = {
  userId?: string;
  operationId?: string;
  managerId?: string;
  orderStatus?: OrderStatus | OrderStatus[];
};

export type CalculateMerchantRating = {
  merchantId?: string;
  merchantManagerId?: string;
  totalSuccessOrder?: number;
  totalOrder?: number;
};

export type AdjustmentRating = {
  managerId: string;
  totalOrderCompleted?: number;
  totalRateCompleted?: number;
};

export type ReportQueryType = {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  managerIds?: string[];
  tradeType?: TradeType;
  assetIds?: string[];
  staffType?: StaffType;
  staffIds?: string[];
  userId?: string;
  fileFormat: FileFormat;
};

export type CrawlBenchmarkPriceType = {
  tradeType: TradeType;
  assetname: string;
};
