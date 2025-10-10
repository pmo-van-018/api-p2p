import {MigrationInterface, QueryRunner} from "typeorm";

export class numberOfExtension1694059524652 implements MigrationInterface {
    name = 'numberOfExtension1694059524652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`number_of_extension\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`number_of_extension\``);
    }

}
