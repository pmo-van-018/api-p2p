import {MigrationInterface, QueryRunner} from "typeorm";

export class addAppealResolved1690963136062 implements MigrationInterface {
    name = 'addAppealResolved1690963136062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`appeal_resolved\` tinyint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`appeal_resolved\``);
    }

}
