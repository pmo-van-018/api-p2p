import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateCompositeIndexInPost1692331960546 implements MigrationInterface {
  name = 'updateCompositeIndexInPost1692331960546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_3dd742723f71ed49d0d4d7220bf\``);
    await queryRunner.query(`DROP INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\``);
    await queryRunner.query(`ALTER TABLE \`posts\` ADD \`is_show\` tinyint NOT NULL DEFAULT 0`);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_3dd742723f71ed49d0d4d7220bf\` FOREIGN KEY (\`asset_id\`) REFERENCES \`assets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_77e05309e1b6a22529b230d8d5\` ON \`posts\` (\`asset_id\`, \`status\`, \`type\`, \`is_show\`, \`fiat_id\`, \`real_price\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_3dd742723f71ed49d0d4d7220bf\``);
    await queryRunner.query(`DROP INDEX \`IDX_77e05309e1b6a22529b230d8d5\` ON \`posts\``);
    await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`is_show\``);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_3dd742723f71ed49d0d4d7220bf\` FOREIGN KEY (\`asset_id\`) REFERENCES \`assets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\` (\`asset_id\`, \`status\`, \`type\`)`
    );
  }
}
