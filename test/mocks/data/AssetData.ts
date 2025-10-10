import { Asset } from '../../../src/api/models/Asset';

export const assetData: Asset[] = [];

export const mockAsset = () => {
  const asset = new Asset();
  asset.id = assetData.length + 1;
  asset.symbol = 'VNDT';
  asset.precision = 2;
  assetData.push(asset);
  return asset;
};
