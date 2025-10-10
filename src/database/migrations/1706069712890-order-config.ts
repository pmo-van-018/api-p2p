import {MigrationInterface, QueryRunner} from "typeorm";

export class orderConfig1706069712890 implements MigrationInterface {
    name = 'orderConfig1706069712890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`configuration\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`configuration\``);
    }
}
