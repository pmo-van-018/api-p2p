import {MigrationInterface, QueryRunner} from "typeorm";

export class maintenance1710231457463 implements MigrationInterface {
    name = 'maintenance1710231457463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`asset_maintenance\` text DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`wallet_maintenance\` text DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`wallet_maintenance\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`asset_maintenance\``);

    }

}
