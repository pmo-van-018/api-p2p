import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuditPostsOperations1700103096417 implements MigrationInterface {
    name = 'updateAuditPostsOperations1700103096417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`updated_by\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`created_by\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`updated_by\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD \`created_by\` varchar(36) NULL`);
        
        // migrate data for posts
        await queryRunner.query(`UPDATE posts SET posts.created_by = posts.merchant_id`);

        // migrate data for operations
        await queryRunner.query(`UPDATE operations SET operations.created_by = operations.merchant_manager_id WHERE operations.merchant_manager_id IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`created_by\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP COLUMN \`updated_by\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`created_by\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`updated_by\``);
    }

}
