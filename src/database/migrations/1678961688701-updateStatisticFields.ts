import {MigrationInterface, QueryRunner} from "typeorm";

export class updateStatisticFields1678961688701 implements MigrationInterface {
    name = 'updateStatisticFields1678961688701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_buy_order_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_sell_order_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_amount_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_fee_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_penalty_fee_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`last_count_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`number_transaction_sell\` \`number_transaction_sell\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`number_transaction_buy\` \`number_transaction_buy\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`amount_transaction\` \`amount_transaction\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`total_fee\` \`total_fee\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`total_penalty_fee\` \`total_penalty_fee\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` ADD \`number_transaction_success\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`volume\` DROP COLUMN \`number_transaction_success\``);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`total_penalty_fee\` \`total_penalty_fee\` decimal(27,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`total_fee\` \`total_fee\` decimal(27,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`amount_transaction\` \`amount_transaction\` decimal(27,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`number_transaction_buy\` \`number_transaction_buy\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`number_transaction_sell\` \`number_transaction_sell\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`last_count_at\``)
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_penalty_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_amount_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_sell_order_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_buy_order_count\``);
    }

}
