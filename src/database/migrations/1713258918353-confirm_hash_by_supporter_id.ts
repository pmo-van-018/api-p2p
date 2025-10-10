import {MigrationInterface, QueryRunner} from "typeorm";

export class confirmHashBySupporterId1713258918353 implements MigrationInterface {
    name = 'confirmHashBySupporterId1713258918353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`confirm_hash_by_supporter_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_7b853f7632d6169934eeb05d55a\` FOREIGN KEY (\`confirm_hash_by_supporter_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_7b853f7632d6169934eeb05d55a\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`confirm_hash_by_supporter_id\``);
    }

}
