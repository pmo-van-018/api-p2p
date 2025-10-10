import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOrderStatisticFields1675759091315 implements MigrationInterface {
    name = 'updateOrderStatisticFields1675759091315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`order_waiting_user_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`order_appeal_count\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`order_appeal_count\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`order_waiting_user_count\``);
    }

}
