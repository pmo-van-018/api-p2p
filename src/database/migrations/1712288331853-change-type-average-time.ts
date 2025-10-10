import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTypeAverageTime1712288331853 implements MigrationInterface {
    name = 'changeTypeAverageTime1712288331853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_completed_time\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_completed_time\` varchar(255) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_cancelled_time\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_cancelled_time\` varchar(255) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_cancelled_time\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_cancelled_time\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_completed_time\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_completed_time\` int NOT NULL DEFAULT '0'`);
    }

}
