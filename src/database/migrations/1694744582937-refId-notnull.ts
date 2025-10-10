import {MigrationInterface, QueryRunner} from "typeorm";

export class refIdNotnull1694744582937 implements MigrationInterface {
    name = 'refIdNotnull1694744582937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` CHANGE \`ref_id\` \`ref_id\` varchar(20) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` CHANGE \`ref_id\` \`ref_id\` varchar(20) NULL`);
    }

}
