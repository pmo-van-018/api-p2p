import {MigrationInterface, QueryRunner} from "typeorm";

export class changePercentType1712735551327 implements MigrationInterface {
    name = 'changePercentType1712735551327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` MODIFY COLUMN \`benchmark_percent\` decimal(7,4) NULL DEFAULT '0.0000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` MODIFY COLUMN \`benchmark_percent\`int NULL DEFAULT '0'`);
    }

}
