import {MigrationInterface, QueryRunner} from "typeorm";

export class volumn1687402071586 implements MigrationInterface {
    name = 'volumn1687402071586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`volume\` ADD \`number_transaction_cancelled\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`volume\` ADD \`number_transaction_appeal\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`volume\` DROP COLUMN \`number_transaction_appeal\``);
        await queryRunner.query(`ALTER TABLE \`volume\` DROP COLUMN \`number_transaction_cancelled\``);
    }

}
