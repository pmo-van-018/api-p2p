import {MigrationInterface, QueryRunner} from "typeorm";

export class paymentanotheraccount1719806765525 implements MigrationInterface {
    name = 'paymentanotheraccount1719806765525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`is_payment_from_another_account\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`is_payment_from_another_account\``);
    }

}
