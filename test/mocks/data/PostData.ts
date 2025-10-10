import { PostStatus, TradeType } from '../../../src/api/models/P2PEnum';
import { Post } from '../../../src/api/models/Post';
import { mockAsset } from './AssetData';
import { mockFiat } from './FiatData';
import { mockMerchant } from './UserData';

export const postData: Post[] = [];

export const mockPost = (status = PostStatus.ONLINE, type = TradeType.BUY) => {
  const post = new Post();
  post.id = postData.length + 1;
  post.merchantId = mockMerchant().id;
  post.assetId = mockAsset().id;
  post.fiatId = mockFiat().id;
  post.availableAmount = 1000;
  post.minOrderAmount = 10;
  post.maxOrderAmount = 1000;
  post.status = status;
  post.paymentTimeLimit = 15;
  post.price = 1.123456;
  post.totalFee = 0.01;
  post.totalPenaltyFee = 0.02;
  post.realPrice = 1.134691;
  post.type = type;
  post.paymentTimeLimit = 15;
  postData.push(post);
  return post;
};

export const mockPostBuyOnline = () => {
  return mockPost();
};

export const mockPostOffline = () => {
  return mockPost(PostStatus.OFFLINE, TradeType.BUY);
};

export const mockPostSell = () => {
  return mockPost(PostStatus.ONLINE, TradeType.SELL);
};
