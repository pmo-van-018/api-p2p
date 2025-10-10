import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PublicViewAdjustmentRepository } from '@api/statistic/repositories/PublicViewAdjustmentRepository';
import { PublicViewAdjustment } from "../models/PublicViewAdjustment";

@Service()
export class SharePublicViewAdjustmentService {
    constructor(
        @InjectRepository() protected publicViewAdjustmentRepository: PublicViewAdjustmentRepository,
    ) { }
    
    public async getPublicViewAdjustmentByManagerId(managerId: string): Promise<PublicViewAdjustment> {
        return this.publicViewAdjustmentRepository.getPublicViewAdjustmentByManagerId(managerId);
    }

    public async getPublicViewAdjustments(): Promise<PublicViewAdjustment[]> {
        return this.publicViewAdjustmentRepository.getPublicViewAdjustments();
    }
}