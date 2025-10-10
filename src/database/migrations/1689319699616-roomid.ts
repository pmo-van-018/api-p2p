import {MigrationInterface, QueryRunner} from "typeorm";

export class roomid1689319699616 implements MigrationInterface {
    name = 'roomid1689319699616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`room_id\` varchar(36) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`room_id\``);
    }

}
