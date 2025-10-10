import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCompositeIndexInPost1693387218543 implements MigrationInterface {
  name = 'addCompositeIndexInPost1693387218543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_182611f5738fcf77972d9cd9cb\` ON \`posts\` (\`status\`, \`type\`, \`is_show\`, \`real_price\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_182611f5738fcf77972d9cd9cb\` ON \`posts\``);
  }
}
