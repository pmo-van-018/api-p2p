import {MigrationInterface, QueryRunner} from "typeorm";

export class benchmarkPercentOrder1722309417488 implements MigrationInterface {
    name = 'benchmarkPercentOrder1722309417488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`benchmark_percent\` \`benchmark_percent\` decimal(27,8) NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`benchmark_percent\` \`benchmark_percent\` decimal(27,8) NULL DEFAULT '0.00000000'`);
    }

}
