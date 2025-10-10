import {ethers} from 'ethers';
import {BLOCKCHAIN_NETWORKS} from '@api/common/models';

export function isEthereumWalletAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

export function getCurrentNetWorkUsedWalletAddress (walletAddress: string): string {
  if (!walletAddress) {
    return null;
  }

  return isEthereumWalletAddress(walletAddress) ? BLOCKCHAIN_NETWORKS.ETHEREUM : BLOCKCHAIN_NETWORKS.TRON;
}
export function isUnSupportedNetwork (currentNameNetwork: string, assetNetwork: string): boolean {
  const currentAssetNetwork = assetNetwork === BLOCKCHAIN_NETWORKS.TRON
    ? BLOCKCHAIN_NETWORKS.TRON : BLOCKCHAIN_NETWORKS.ETHEREUM;
  return currentNameNetwork !== currentAssetNetwork;
}
