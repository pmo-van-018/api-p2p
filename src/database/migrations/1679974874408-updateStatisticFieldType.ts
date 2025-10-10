import {MigrationInterface, QueryRunner} from "typeorm";

export class updateStatisticFieldType1679974874408 implements MigrationInterface {
    name = 'updateStatisticFieldType1679974874408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_amount_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_amount_count\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_fee_count\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_penalty_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_penalty_fee_count\` decimal(27,8) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_penalty_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_penalty_fee_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_fee_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_fee_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`total_amount_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`total_amount_count\` int NOT NULL DEFAULT '0'`);
    }

}
