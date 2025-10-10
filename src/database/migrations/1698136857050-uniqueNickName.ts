import {MigrationInterface, QueryRunner} from "typeorm";

export class uniqueNickName1698136857050 implements MigrationInterface {
    name = 'uniqueNickName1698136857050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` ADD UNIQUE INDEX \`IDX_572630a8efa6a7a062b2febff6\` (\`nick_name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` DROP INDEX \`IDX_572630a8efa6a7a062b2febff6\``);
    }

}
