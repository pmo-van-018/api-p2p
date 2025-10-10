import {MigrationInterface, QueryRunner} from "typeorm";

export class addLastLoginTime1679019381804 implements MigrationInterface {
    name = 'addLastLoginTime1679019381804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`last_login_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_login_at\``);
    }

}
