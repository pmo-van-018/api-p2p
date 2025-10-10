import {MigrationInterface, QueryRunner} from "typeorm";

export class isClearAppeal1685933614332 implements MigrationInterface {
    name = 'isClearAppeal1685933614332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`is_clear\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`is_clear\``);
    }

}
