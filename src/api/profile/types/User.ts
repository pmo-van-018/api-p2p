import { OperationType, UserType } from '@api/common/models/P2PEnum';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';

// TODO: change to Member type
export type UserOrOperation = User | Operation;
export type Member = User | Operation;
export type UserTypeOrOperationType = UserType | OperationType;
export type UserViewByAdmin = Partial<Pick<User, 'id' | 'walletAddress' | 'nickName' | 'createdAt' | 'lastLoginAt'>> & {
  totalBuyOrderCount: number;
  totalSellOrderCount: number;
  lastBuyOrder: Date;
  lastSellOrder: Date;
};
export type UserViewByUser = Partial<Pick<User, 'id' | 'walletAddress' | 'nickName' | 'createdAt' | 'lastLoginAt'>> & {
  lastBuyOrder: Date;
  lastSellOrder: Date;
};
