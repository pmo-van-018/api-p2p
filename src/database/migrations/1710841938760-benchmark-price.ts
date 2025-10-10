import {MigrationInterface, QueryRunner} from "typeorm";

export class benchmarkPrice1710841938760 implements MigrationInterface {
    name = 'benchmarkPrice1710841938760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`benchmark_price\` decimal(27,8) NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`benchmark_price\` decimal(27,8) NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`benchmark_percent\` int NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`benchmark_percent\` int NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`benchmark_price\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`benchmark_price\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`benchmark_percent\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`benchmark_percent\``);
    }

}
