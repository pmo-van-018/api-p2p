import { Service } from 'typedi';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';
import { cloneDeep } from 'lodash';
import difference from 'lodash/difference';
import { events } from '@api/subscribers/events';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { ResourceService } from '@api/master-data/services/ResourceService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { DataMaintenanceRequest } from '../requests/Common/DataMaintenanceRequest';
import { SupportedAsset } from '@api/common/models';

@Service()
export class UpdateMaintenanceByAdminUseCase {
  constructor(
    private postService: SharedPostService,
    private adminMasterDataService: AdminMasterDataService,
    private resourceService: ResourceService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateMaintenance(currentUser: Operation, data: DataMaintenanceRequest) {
    this.log.debug(`Start implement updateMaintenance method for: ${currentUser.type}, ${currentUser.walletAddress}`);

    const { walletMaintenance, networkMaintenance } = data;
    const masterDataCommon = await this.adminMasterDataService.getLatestMasterDataCommon();
    const masterDataCloneDeep = cloneDeep(masterDataCommon);
    const allAssets = await this.resourceService.getAllAssets();
    const allAssetsNetwork = allAssets.map((asset) => `${asset.name} (${asset.network})`);

    // Handle update network maintenance
    if (networkMaintenance?.length) {
      this.log.debug('Start implement updateMaintenance method for handle update network maintenance', currentUser.walletAddress);
      const assetsMaintained = [];
      networkMaintenance.forEach((network) => {
        let assetList: string[] = masterDataCommon.assetNetworkTypes.filter((asset: string) => asset.includes(network));

        // If not found asset in network, get all asset in network
        if (!assetList.length) {
          assetList = allAssetsNetwork.filter((asset) => asset.includes(network));
        }
        assetsMaintained.push(...assetList);
      });
      // Disable post using disable assets
      const assetList = await this.resourceService.getAssetByCode(networkMaintenance);
      if (assetList.length) {
        const assetIds = assetList.map((as) => as.id);
        const { items } = await this.postService.offlinePostUsingDisableAssets(assetIds);
        if (items.length) {
          this.eventDispatcher.dispatch(events.actions.system.disableAssetByAdmin, items);
        }
      }
      const differenceAssets = difference(masterDataCommon.assetNetworkTypes, assetsMaintained);
      masterDataCloneDeep.assetNetworkTypes = differenceAssets;
      masterDataCloneDeep.assetMaintenance = assetsMaintained;
    } // Handle disable wallet maintenance
    else if (masterDataCommon.assetMaintenance?.length) { 
      this.log.debug('Start implement updateMaintenance method for handle disable network maintenance', currentUser.walletAddress);
      masterDataCloneDeep.assetNetworkTypes = [...(masterDataCommon.assetMaintenance as SupportedAsset[]), ...masterDataCommon.assetNetworkTypes];
      masterDataCloneDeep.assetMaintenance = [];
    }
    masterDataCloneDeep.walletMaintenance = walletMaintenance;
    await this.adminMasterDataService.updateMasterDataCommon(masterDataCommon, masterDataCloneDeep);
    await this.adminMasterDataService.removeMasterDataCache();

    this.log.debug(`Stop implement updateMaintenance method for: ${currentUser.type} - ${currentUser.walletAddress}`);

    return true;
  }
}
