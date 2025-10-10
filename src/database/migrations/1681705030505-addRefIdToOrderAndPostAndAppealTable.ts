import {MigrationInterface, QueryRunner} from "typeorm";

export class addRefIdToOrderAndPostAndAppealTable1681705030505 implements MigrationInterface {
    name = 'addRefIdToOrderAndPostAndAppealTable1681705030505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`ref_id\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`ref_id\` varchar(20) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`ref_id\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`ref_id\``);
    }

}
