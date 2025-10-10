import { MigrationInterface, QueryRunner } from 'typeorm';

export class txnRpcStatus1701223839299 implements MigrationInterface {
  name = 'txnRpcStatus1701223839299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`crypto_transaction_statuses\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`rpc\` text NOT NULL, \`rpc_hash\` varchar(32) NOT NULL, \`status\` int NOT NULL DEFAULT '1', \`crypto_transaction_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`crypto_transaction_statuses\` ADD CONSTRAINT \`FK_a5f2497198301d24926634bca79\` FOREIGN KEY (\`crypto_transaction_id\`) REFERENCES \`crypto_transactions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UNIQUE_IDX_9d3f0b6b9c8f5b1a7f8c4c5d4c\` ON \`crypto_transaction_statuses\` (\`crypto_transaction_id\`, \`rpc_hash\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`crypto_transaction_statuses\``);
  }
}
