import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserSkipSystemNoteTime1675160924425 implements MigrationInterface {
    name = 'addUserSkipSystemNoteTime1675160924425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`skip_note_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`skip_note_at\``);
    }

}
