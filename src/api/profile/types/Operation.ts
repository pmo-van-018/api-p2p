import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { MerchantType, PaginationInput, PickEnum } from '@api/common/types';
import { StatisticResponse } from '@api/statistic/responses/StatisticResponse';

export type FindOneMerchant = Partial<
  Pick<Operation, 'id' | 'walletAddress' | 'merchantManagerId' | 'status'> & {
    type: MerchantType;
  }
>;

export type FindAllMerchants = Partial<
  Pick<Operation, 'walletAddress' | 'nickName'> & {
    merchantLevels: number | number[];
    merchantManagerIds: number | number[] | string | string[];
    search: string;
    startDate: string;
    endDate: string;
    status: OperationStatus | OperationStatus[];
    isAdmin?: boolean;
  }
> & {
  types: MerchantType | MerchantType[];
} & PaginationInput;

export type FindOperatorExceptSuperAdmin = Partial<
  Pick<Operation, 'merchantManagerId'> & { status: OperationStatus | OperationStatus[] }
> & {
  types:
    | PickEnum<OperationType, OperationType.MERCHANT_OPERATOR | OperationType.MERCHANT_MANAGER>
    | PickEnum<OperationType, OperationType.MERCHANT_OPERATOR | OperationType.MERCHANT_MANAGER>[];
};
export type MerchantPublicInfo = Partial<
  Pick<
    Operation,
    | 'id'
    | 'walletAddress'
    | 'type'
    | 'nickName'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'statistic'
    | 'merchantManager'
    | 'activatedAt'
  > & {
    appealCount: number;
  } & StatisticResponse
>;
