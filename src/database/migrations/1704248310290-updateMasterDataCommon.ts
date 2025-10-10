import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMasterDataCommon1704248310290 implements MigrationInterface {
    name = 'updateMasterDataCommon1704248310290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`user_payment_methods_limit\` int NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`manager_payment_methods_limit\` int NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`appeal_receive_by_supporter_limit\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`appeal_receive_by_admin_supporter_limit\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`support_request_receiving_limit\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`evidence_provision_time_limit\` int NOT NULL DEFAULT '60'`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`crypto_sending_wait_time_limit\` int NOT NULL DEFAULT '5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`crypto_sending_wait_time_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`evidence_provision_time_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`support_request_receiving_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`appeal_receive_by_admin_supporter_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`appeal_receive_by_supporter_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`manager_payment_methods_limit\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`user_payment_methods_limit\``);
    }

}
