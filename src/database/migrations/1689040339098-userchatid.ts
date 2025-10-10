import {MigrationInterface, QueryRunner} from "typeorm";

export class userchatid1689040339098 implements MigrationInterface {
    name = 'userchatid1689040339098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`invite_link\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`group_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`group_log_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`is_clear\``);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`peer_chat_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`peer_chat_id\` varchar(36) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`peer_chat_id\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`peer_chat_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`is_clear\` tinyint NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`group_log_id\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`group_id\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`invite_link\` text NOT NULL`);
    }

}
