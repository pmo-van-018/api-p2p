import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlacklistTable1703336937640 implements MigrationInterface {
  name = 'CreateBlacklistTable1703336937640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`blacklists\` (\`id\` varchar(36) NOT NULL, \`wallet_address\` varchar(255) NOT NULL, \`type\` tinyint NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_20f2e7796ef830b9106b3c9230\` (\`wallet_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`blacklists\``);
  }
}
