import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShiftsTable1704269772049 implements MigrationInterface {
  name = 'CreateShiftsTable1704269772049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`shifts\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`operation_id\` varchar(36) NOT NULL, \`check_in_at\` datetime NOT NULL, \`check_out_at\` datetime NULL, \`start_balance_amount\` json NOT NULL, \`end_balance_amount\` json NULL, \`total_volume\` decimal(64,18) NULL, \`status\` enum ('PROCESSING', 'FINISHED', 'APPROVED') NOT NULL DEFAULT 'PROCESSING', INDEX \`IDX_d9cdeaec5004305b335034ceb9\` (\`created_at\` DESC), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`shifts\` ADD CONSTRAINT \`FK_078039cb1c0134230ede1fd0cc1\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`shifts\` DROP FOREIGN KEY \`FK_078039cb1c0134230ede1fd0cc1\``);
    await queryRunner.query(`DROP INDEX \`IDX_d9cdeaec5004305b335034ceb9\` ON \`shifts\``);
    await queryRunner.query(`DROP TABLE \`shifts\``);
  }
}
