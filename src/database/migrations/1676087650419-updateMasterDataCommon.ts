import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMasterDataCommon1676087650419 implements MigrationInterface {
    name = 'updateMasterDataCommon1676087650419'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`min_order_limit\` decimal(27,0) NOT NULL DEFAULT '150000'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`max_order_limit\` decimal(27,0) NOT NULL DEFAULT '150000000'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`fee\` decimal(10,4) NOT NULL DEFAULT '0.0021'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`penalty_fee\` decimal(10,4) NOT NULL DEFAULT '0.0023'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`user_ask_cs_time\` int NOT NULL DEFAULT '10'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`min_post_limit\` decimal(27,0) NOT NULL DEFAULT '150000'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` ADD \`max_post_limit\` decimal(27,0) NOT NULL DEFAULT '150000000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`min_order_limit\` int NOT NULL DEFAULT '1'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`max_order_limit\` int NOT NULL DEFAULT '1000'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`fee\` decimal(10,4) NOT NULL DEFAULT '0.0132'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`penalty_fee\` decimal(10,4) NOT NULL DEFAULT '0.0132'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` MODIFY COLUMN \`user_ask_cs_time\` int NOT NULL DEFAULT '20'`);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`min_post_limit\``);
      await queryRunner.query(`ALTER TABLE \`master_data_common\` DROP COLUMN \`max_post_limit\``);
    }

}
