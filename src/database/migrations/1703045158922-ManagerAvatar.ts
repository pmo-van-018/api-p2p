import {MigrationInterface, QueryRunner} from "typeorm";

export class ManagerAvatar1703045158922 implements MigrationInterface {
    name = 'ManagerAvatar1703045158922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`avatar\` varchar(64) NULL UNIQUE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`avatar\``);
    }

}
