import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultValueStatisticField1679987518111 implements MigrationInterface {
    name = 'addDefaultValueStatisticField1679987518111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_amount_count\` \`total_amount_count\` decimal(27,8) NOT NULL DEFAULT '0.00000000'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_fee_count\` \`total_fee_count\` decimal(27,8) NOT NULL DEFAULT '0.00000000'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_penalty_fee_count\` \`total_penalty_fee_count\` decimal(27,8) NOT NULL DEFAULT '0.00000000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_penalty_fee_count\` \`total_penalty_fee_count\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_fee_count\` \`total_fee_count\` decimal(27,8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`total_amount_count\` \`total_amount_count\` decimal(27,8) NOT NULL`);
    }

}
