import {MigrationInterface, QueryRunner} from "typeorm";

export class addOperationIdToPaymentMethodTable1682170336908 implements MigrationInterface {
    name = 'addOperationIdToPaymentMethodTable1682170336908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_methods\` ADD \`operation_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_methods\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_methods\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_methods\` DROP COLUMN \`operation_id\``);
    }

}
