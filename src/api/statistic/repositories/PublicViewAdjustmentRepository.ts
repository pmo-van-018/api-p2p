import { EntityRepository } from "typeorm";
import { PublicViewAdjustment } from "../models/PublicViewAdjustment";
import { RepositoryBase } from "@api/infrastructure/abstracts/RepositoryBase";

@EntityRepository(PublicViewAdjustment)
export class PublicViewAdjustmentRepository extends RepositoryBase<PublicViewAdjustment> {
    public async getPublicViewAdjustmentByManagerId(managerId: string): Promise<PublicViewAdjustment> {
        return this.createQueryBuilder('public_view_adjustments')
            .where('manager_id = :managerId', { managerId })
            .getOne();
    }

    public async getPublicViewAdjustments(): Promise<PublicViewAdjustment[]> {
        return this.createQueryBuilder('public_view_adjustments')
            .getMany();
    }

    public async createPublicViewAdjustment(entity: PublicViewAdjustment): Promise<boolean> {
        await this.save(entity);
        return true;
    }

    public async updatePublicViewAdjustment(id: string, entity: Pick<PublicViewAdjustment, 'totalOrderCompleted' | 'totalRateCompleted'>): Promise<boolean> {
        const result = await this.update(id, entity);
        return !!result.affected;
    }
}
