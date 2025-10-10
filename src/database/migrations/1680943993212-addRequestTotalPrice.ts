import {MigrationInterface, QueryRunner} from "typeorm";

export class addRequestTotalPrice1680943993212 implements MigrationInterface {
    name = 'addRequestTotalPrice1680943993212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`config\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`request_total_price\` decimal(27,8) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`request_total_price\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`config\` text NOT NULL`);
    }

}
