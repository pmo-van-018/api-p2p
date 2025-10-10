import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAppealSecret1703577204123 implements MigrationInterface {
    name = 'AddAppealSecret1703577204123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`secret\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD UNIQUE INDEX \`IDX_f95ecea1f278fed2bf99e6e647\` (\`secret\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP INDEX \`IDX_f95ecea1f278fed2bf99e6e647\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`secret\``);
    }

}
