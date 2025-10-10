import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTwoFactorAuthTable1705636996155 implements MigrationInterface {
  name = 'createTwoFactorAuthTable1705636996155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`two_factor_auth\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NULL, \`operation_id\` varchar(36) NULL, \`totp_secret\` varchar(255) NULL, \`totp_status\` tinyint NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`two_factor_auth\` ADD CONSTRAINT \`FK_7bcf386cb8ecc2d75eada9357b1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`two_factor_auth\` ADD CONSTRAINT \`FK_0f162b018a4f57a84ba44243fb0\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`two_factor_auth\` DROP FOREIGN KEY \`FK_0f162b018a4f57a84ba44243fb0\``);
    await queryRunner.query(`ALTER TABLE \`two_factor_auth\` DROP FOREIGN KEY \`FK_7bcf386cb8ecc2d75eada9357b1\``);
    await queryRunner.query(`DROP TABLE \`two_factor_auth\``);
  }
}
