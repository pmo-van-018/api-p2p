import {MigrationInterface, QueryRunner} from "typeorm";

export class addAllowNotificationToUser1675412002949 implements MigrationInterface {
    name = 'addAllowNotificationToUser1675412002949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`allow_notification\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`allow_notification\``);
    }

}
