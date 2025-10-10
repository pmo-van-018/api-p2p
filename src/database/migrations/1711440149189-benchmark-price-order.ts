import {MigrationInterface, QueryRunner} from "typeorm";

export class benchmarkPriceOrder1711440149189 implements MigrationInterface {
    name = 'benchmarkPriceOrder1711440149189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`benchmark_price_at_created\` decimal(27,8) NULL DEFAULT '0.00000000'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`benchmark_price_at_sent\` decimal(27,8) NULL DEFAULT '0.00000000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`benchmark_price_at_sent\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`benchmark_price_at_created\``);
    }

}
