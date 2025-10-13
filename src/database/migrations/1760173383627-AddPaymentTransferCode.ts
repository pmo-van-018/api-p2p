import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPaymentTransferCode1760173383627 implements MigrationInterface {
    name = 'AddPaymentTransferCode1760173383627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` ADD \`transfer_code\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` DROP COLUMN \`transfer_code\``);
    }

}
