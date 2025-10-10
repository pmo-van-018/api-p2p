import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserAddColumnAvatar1708394784400 implements MigrationInterface {
    name = 'updateUserAddColumnAvatar1708394784400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar\` varchar(64) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar\``);
    }

}
