import {MigrationInterface, QueryRunner} from "typeorm";

export class addGaslessOperationModel1710989876983 implements MigrationInterface {
    name = 'addGaslessOperationModel1710989876983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`allow_gasless\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`gasles_trans_limit\` decimal(27,8) NOT NULL DEFAULT '0.00000000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`gasles_trans_limit\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`allow_gasless\``);
    }

}
