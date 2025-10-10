import {MigrationInterface, QueryRunner} from "typeorm";

export class paymentUser1684136834044 implements MigrationInterface {
    name = 'paymentUser1684136834044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operations\` CHANGE \`type\` \`type\` tinyint NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`operation_id\` \`operation_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_methods\` ADD CONSTRAINT \`FK_d7d7fb15569674aaadcfbc0428c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_methods\` ADD CONSTRAINT \`FK_45118ccf0cfe385a643f508947d\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_methods\` DROP FOREIGN KEY \`FK_45118ccf0cfe385a643f508947d\``);
        await queryRunner.query(`ALTER TABLE \`payment_methods\` DROP FOREIGN KEY \`FK_d7d7fb15569674aaadcfbc0428c\``);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`operation_id\` \`operation_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`operations\` CHANGE \`type\` \`type\` tinyint NOT NULL DEFAULT '4'`);
    }

}
