import {MigrationInterface, QueryRunner} from "typeorm";

export class setNullPayment1700042592272 implements MigrationInterface {
    name = 'setNullPayment1700042592272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ffe1b182ad69c344e48536ffd5c\``);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` DROP FOREIGN KEY \`FK_8f86592ff88da78f3c120568c9c\``);
        await queryRunner.query(`DROP INDEX \`IDX_572630a8efa6a7a062b2febff6\` ON \`operations\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c74fcf2c5e4085690c6f33098\` ON \`wallet_address_managements\``);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` ADD UNIQUE INDEX \`IDX_8e811725f25a11ff358d1d914c\` (\`wallet_address\`)`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ffe1b182ad69c344e48536ffd5c\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` ADD CONSTRAINT \`FK_cd1d390abd3bbb3e46eb6b2da6b\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` DROP FOREIGN KEY \`FK_cd1d390abd3bbb3e46eb6b2da6b\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ffe1b182ad69c344e48536ffd5c\``);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` DROP INDEX \`IDX_8e811725f25a11ff358d1d914c\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_2c74fcf2c5e4085690c6f33098\` ON \`wallet_address_managements\` (\`wallet_address\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_572630a8efa6a7a062b2febff6\` ON \`operations\` (\`nick_name\`)`);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` ADD CONSTRAINT \`FK_8f86592ff88da78f3c120568c9c\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ffe1b182ad69c344e48536ffd5c\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
