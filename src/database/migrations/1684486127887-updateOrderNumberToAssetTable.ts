import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOrderNumberToAssetTable1684486127887 implements MigrationInterface {
    name = 'updateOrderNumberToAssetTable1684486127887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ffe1b182ad69c344e48536ffd5c\``);
        await queryRunner.query(`ALTER TABLE \`assets\` ADD \`order_number\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` CHANGE \`merchant_to_user_time_sell\` \`merchant_to_user_time_sell\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ffe1b182ad69c344e48536ffd5c\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ffe1b182ad69c344e48536ffd5c\``);
        await queryRunner.query(`ALTER TABLE \`master_data_common\` CHANGE \`merchant_to_user_time_sell\` \`merchant_to_user_time_sell\` int NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE \`assets\` DROP COLUMN \`order_number\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ffe1b182ad69c344e48536ffd5c\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
