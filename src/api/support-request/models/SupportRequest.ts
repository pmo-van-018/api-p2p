import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Type } from 'class-transformer';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { SupportRequestStatus, SupportRequestType } from '@api/support-request/models/SupportRequestEnum';

@Entity({ name: 'support_requests' })
export class SupportRequest extends EntityBase {
    @Column({ name: 'admin_id', nullable: true, length: 36 })
    public adminId: string;

    @Column({ name: 'user_id', nullable: false, length: 36 })
    public userId: string;

    @Column({ name: 'room_id', nullable: false, length: 24, unique: true })
    public roomId: string;

    @Column({ name: 'ref_id', unique: true, length: 20, nullable: false})
    public refId: string;

    @Column({ name: 'status', nullable: false, type: 'varchar', length: 10, default: SupportRequestStatus.PENDING })
    public status: SupportRequestStatus;

    @Column({ name: 'type', nullable: false, type: 'tinyint'})
    public type: SupportRequestType;

    @ManyToOne(() => Operation, (admin) => admin.supportRequests)
    @JoinColumn({ name: 'admin_id' })
    @Type(() => Operation)
    public admin: Operation;

    @ManyToOne(() => User, (user) => user.supportRequests)
    @JoinColumn({ name: 'user_id' })
    @Type(() => User)
    public user: User;

    @Column({ name: 'completed_at', nullable: true })
    public completedAt: Date;
}
