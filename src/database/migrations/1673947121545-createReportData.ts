import { MigrationInterface, QueryRunner } from 'typeorm';

export class createReportData1673947121545 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`volume\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NOT NULL, \`date_trans\` datetime(6) NULL, \`number_transaction_sell\` int  DEFAULT NULL, \`number_transaction_buy\` int  DEFAULT NULL, \`amount_transaction\` decimal(27,8) DEFAULT NULL, \`total_fee\` decimal(27,8) DEFAULT NULL, \`total_penalty_fee\` decimal(27,8) DEFAULT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`volume\``);
  }
}
