import {MigrationInterface, QueryRunner} from "typeorm";

export class addFKUserIdToStatistics1682090563146 implements MigrationInterface {
    name = 'addFKUserIdToStatistics1682090563146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD UNIQUE INDEX \`IDX_62fa61febb58e0ef44ef3cfec1\` (\`user_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP INDEX \`IDX_62fa61febb58e0ef44ef3cfec1\``);
    }

}
