import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndexAssetIdStatusTypeInPost1677993312948 implements MigrationInterface {
    name = 'addIndexAssetIdStatusTypeInPost1677993312948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\` (\`asset_id\`, \`status\`, \`type\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\``);
    }

}
