import moment from 'moment';

import { faker } from '@faker-js/faker';

import { UserType } from '../../../src/api/models/P2PEnum';
import { Operation } from '../../../src/api/models/Operation';

export const userData: Operation[] = [];

export const mockUserViolateRule = (): any => {
  const user = new Operation();
  user.id = userData.length + 1;
  user.nickName = faker.name.fullName();
  user.type = UserType.USER;
  user.walletAddress = '0x3D59A9F9001D8Ef2c46F3760b5477Ac596660CF6';
  user.lockEndTime = moment.utc().add(24, 'hours').toDate();
  userData.push(user);
  return user;
};

export const mockUser = () => {
  const user = new Operation();
  user.id = userData.length + 1;
  user.nickName = faker.name.fullName();
  user.type = UserType.USER;
  user.lockEndTime = null;
  user.walletAddress = '0x7927DA51ABa1b5709cf0262ef2E30acF34D1aE89';
  userData.push(user);
  return user;
};

export const mockMerchant = () => {
  const merchant = new Operation();
  merchant.id = userData.length + 1;
  merchant.nickName = faker.name.firstName();
  merchant.type = UserType.MERCHANT;
  merchant.lockEndTime = null;
  merchant.walletAddress = '0x7927DA51ABa1b5709cf0262ef2E30acF34D1aE89';
  userData.push(merchant);
  return merchant;
};
