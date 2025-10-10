import {MigrationInterface, QueryRunner} from "typeorm";

export class addActivedAt1677655881848 implements MigrationInterface {
    name = 'addActivedAt1677655881848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`actived_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`actived_at\``);
    }

}
