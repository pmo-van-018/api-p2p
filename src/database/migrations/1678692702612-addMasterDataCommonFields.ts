import {MigrationInterface, QueryRunner} from "typeorm";

export class addMasterDataCommonFields1678692702612 implements MigrationInterface {
    name = 'addMasterDataCommonFields1678692702612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`merchant_to_user_time_sell\` int NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`merchant_to_user_time_buy\` int NOT NULL DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`merchant_to_user_time_buy\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`merchant_to_user_time_sell\``);
    }

}
