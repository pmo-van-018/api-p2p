import {MigrationInterface, QueryRunner} from "typeorm";

export class failCodeTransaction1712759202222 implements MigrationInterface {
    name = 'failCodeTransaction1712759202222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`crypto_transactions\` ADD \`fail_code\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`crypto_transactions\` DROP COLUMN \`fail_code\``);
    }

}
