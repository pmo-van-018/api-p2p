import {MigrationInterface, QueryRunner} from "typeorm";

export class addMetadataToMasterDataCommonTable1712649932630 implements MigrationInterface {
    name = 'addMetadataToMasterDataCommonTable1712649932630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`metadata\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`metadata\``);
    }

}
