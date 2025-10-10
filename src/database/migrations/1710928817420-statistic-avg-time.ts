import {MigrationInterface, QueryRunner} from "typeorm";

export class statisticAvgTime1710928817420 implements MigrationInterface {
    name = 'statisticAvgTime1710928817420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_completed_time\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`average_cancelled_time\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_cancelled_time\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`average_completed_time\``);
    }

}
