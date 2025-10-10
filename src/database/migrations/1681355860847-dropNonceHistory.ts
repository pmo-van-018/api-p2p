import {MigrationInterface, QueryRunner} from "typeorm";

export class dropNonceHistory1681355860847 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE \`nonce_histories\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE \`nonce_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`nonce\` varchar(255) NOT NULL, \`exp\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

}
