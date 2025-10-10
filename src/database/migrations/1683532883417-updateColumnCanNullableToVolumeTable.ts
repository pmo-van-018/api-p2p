import {MigrationInterface, QueryRunner} from "typeorm";

export class updateColumnCanNullableToVolumeTable1683532883417 implements MigrationInterface {
    name = 'updateColumnCanNullableToVolumeTable1683532883417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`operation_id\` \`operation_id\` varchar(36) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`operation_id\` \`operation_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL`);
    }

}
