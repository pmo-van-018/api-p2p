import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { PublicViewAdjustmentService } from '@api/statistic/services/PublicViewAdjustmentService';
import { CreatePublicViewAdjustmentRequest } from '../requests/CreatePublicViewAdjustmentRequest';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { PublicViewAdjustmentError } from '../errors/PublicViewAdjustment';
import { ErrorInfo } from '@api/infrastructure/helpers/ErrorInfo';
import { SharedVolumeService } from '@api/statistic/services/SharedVolumeService';

@Service()
export class UpsertPublicViewAdjustmentUseCase {
    constructor(
        private sharedProfileService: SharedProfileService,
        private publicViewAdjustmentService: PublicViewAdjustmentService,
        private sharedVolumeService: SharedVolumeService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async upsertPublicViewAdjstment(dto: CreatePublicViewAdjustmentRequest, managerId: string): Promise<boolean | ErrorInfo> {
        this.log.debug(`Start implement upsertPublicViewAdjstment with params: ${JSON.stringify(dto)}`);
        const manager = await this.sharedProfileService.findManagerById(managerId);
        if (!manager) {
            return PublicViewAdjustmentError.MANAGER_NOT_FOUND;
        }
        const adjustmentRate = await this.publicViewAdjustmentService.getPublicViewAdjustmentByManagerId(managerId);
        let result: boolean;
        if (adjustmentRate) {
            result = await this.publicViewAdjustmentService.updatePublicViewAdjustment(adjustmentRate.id, dto);
        } else {
            result = await this.publicViewAdjustmentService.createPublicViewAdjustment(dto, managerId);
        }
        await this.sharedVolumeService.clearAdjustmentCache();
        this.log.debug(`Stop implement upsertPublicViewAdjstment with result: ${result}`);
        return result;
    }
}
