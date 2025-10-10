import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTypeRoleInUser1679374304883 implements MigrationInterface {
  name = 'changeTypeRoleInUser1679374304883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`type\``);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`type\` decimal(2,1) NOT NULL DEFAULT '1.0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`type\``);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`type\` tinyint NOT NULL DEFAULT '1'`);
  }
}
