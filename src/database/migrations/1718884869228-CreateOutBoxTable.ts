import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutBoxTable1718884869228 implements MigrationInterface {
  name = 'CreateOutBoxTable1718884869228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`outbox\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sent_at\` datetime NULL, \`topic\` varchar(255) NOT NULL, \`event_type\` varchar(255) NOT NULL, \`aggregate_id\` varchar(255) NOT NULL, \`payload\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`outbox\``);
  }
}
