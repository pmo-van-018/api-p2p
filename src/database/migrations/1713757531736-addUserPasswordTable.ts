import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserPasswordTable1713757531736 implements MigrationInterface {
    name = 'addUserPasswordTable1713757531736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_password\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`username\` varchar(255) NOT NULL, \`password\` text NOT NULL, UNIQUE INDEX \`IDX_a286b69738cb041099839b5315\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a286b69738cb041099839b5315\` ON \`user_password\``);
        await queryRunner.query(`DROP TABLE \`user_password\``);
    }

}
