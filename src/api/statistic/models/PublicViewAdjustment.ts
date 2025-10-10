import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Operation } from '@api/profile/models/Operation';

@Entity({ name: 'public_view_adjustments' })
@Index(['managerId'], { unique: true })
export class PublicViewAdjustment extends EntityBase {
    @Column({ name: 'manager_id', nullable: false, length: 36 })
    public managerId: string;
    
    @JoinColumn({ name: 'manager_id' })
    @ManyToOne(() => Operation)
    public manager: Operation;
    
    @Column({ name: 'total_order_completed', default: 0 })
    public totalOrderCompleted: number;

    @Column({ name: 'total_rate_completed', default: 0, type: 'decimal', precision: 27, scale: 8 })
    public totalRateCompleted: number;

    @AfterLoad()
    public afterLoad(): void {
        if (this.totalRateCompleted) {
            this.totalRateCompleted = Number(this.totalRateCompleted);
        }
    }
}
