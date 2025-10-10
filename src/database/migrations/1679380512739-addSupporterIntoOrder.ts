import {MigrationInterface, QueryRunner} from "typeorm";

export class addSupporterIntoOrder1679380512739 implements MigrationInterface {
    name = 'addSupporterIntoOrder1679380512739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`supporter_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_316f906335ce15e2848af3dd53a\` FOREIGN KEY (\`supporter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_316f906335ce15e2848af3dd53a\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`supporter_id\``);
    }

}
