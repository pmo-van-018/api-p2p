import { Logger, LoggerInterface } from "@base/decorators/Logger";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PublicViewAdjustmentRepository } from '@api/statistic/repositories/PublicViewAdjustmentRepository';
import { PublicViewAdjustment } from "../models/PublicViewAdjustment";
import { CreatePublicViewAdjustmentRequest } from "../requests/CreatePublicViewAdjustmentRequest";
import { UpdatePublicViewAdjustmentRequest } from "../requests/UpdatePublicViewAdjustmentRequest";

@Service()
export class PublicViewAdjustmentService {
    constructor(
        @InjectRepository() protected publicViewAdjustmentRepository: PublicViewAdjustmentRepository,
        @Logger(__filename) private logger: LoggerInterface
    ) { }

    public async getPublicViewAdjustmentByManagerId(managerId: string): Promise<PublicViewAdjustment> { 
        return this.publicViewAdjustmentRepository.getPublicViewAdjustmentByManagerId(managerId);
    }

    public async createPublicViewAdjustment(dto: CreatePublicViewAdjustmentRequest, managerId: string): Promise<boolean> {
        this.logger.debug('Start implement createPublicViewAdjustment');
        const publicViewAdjustment = new PublicViewAdjustment();
        publicViewAdjustment.managerId = managerId;
        publicViewAdjustment.totalOrderCompleted = dto.totalOrderCompleted;
        publicViewAdjustment.totalRateCompleted = dto.totalRateCompleted / 100;
        await this.publicViewAdjustmentRepository.createPublicViewAdjustment(publicViewAdjustment);
        this.logger.debug('Stop implement createPublicViewAdjustment');
        return true;
    }
    
    public async updatePublicViewAdjustment(id: string, dto: UpdatePublicViewAdjustmentRequest): Promise<boolean> {
        this.logger.debug('Start implement updatePublicViewAdjustment');
        const payload: Pick<PublicViewAdjustment, 'totalOrderCompleted' | 'totalRateCompleted'> = {
            totalOrderCompleted: dto.totalOrderCompleted,
            totalRateCompleted: dto.totalRateCompleted / 100
        };
        const result = await this.publicViewAdjustmentRepository.updatePublicViewAdjustment(id, payload);
        this.logger.debug('Stop implement updatePublicViewAdjustment');
        return result;
    }
}