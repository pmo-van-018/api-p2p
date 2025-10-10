import {MigrationInterface, QueryRunner} from "typeorm";

export class paymentInfo1725848662590 implements MigrationInterface {
    name = 'paymentInfo1725848662590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`payment_info\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`payment_info\``);
    }

}
