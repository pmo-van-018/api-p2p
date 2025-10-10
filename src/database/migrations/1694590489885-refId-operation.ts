import {MigrationInterface, QueryRunner} from "typeorm";

export class refIdOperation1694590489885 implements MigrationInterface {
    name = 'refIdOperation1694590489885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`ref_id\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD UNIQUE INDEX \`IDX_df217062d2761828fa38dae3b9\` (\`ref_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` DROP INDEX \`IDX_df217062d2761828fa38dae3b9\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`ref_id\``);
    }

}
