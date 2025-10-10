import {MigrationInterface, QueryRunner} from "typeorm";

export class isReferred1697688128482 implements MigrationInterface {
    name = 'isReferred1697688128482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_referred\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_referred\``);
    }

}
