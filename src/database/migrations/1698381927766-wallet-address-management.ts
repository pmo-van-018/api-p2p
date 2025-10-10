import {MigrationInterface, QueryRunner} from "typeorm";

export class walletAddressManagement1698381927766 implements MigrationInterface {
    name = 'walletAddressManagement1698381927766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`wallet_address_managements\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`wallet_address\` varchar(255) NOT NULL, \`operation_id\` varchar(36) NOT NULL, \`status\` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE', UNIQUE INDEX \`IDX_2c74fcf2c5e4085690c6f33098\` (\`wallet_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` ADD CONSTRAINT \`FK_8f86592ff88da78f3c120568c9c\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet_address_managements\` DROP FOREIGN KEY \`FK_8f86592ff88da78f3c120568c9c\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c74fcf2c5e4085690c6f33098\` ON \`wallet_address_managements\``);
        await queryRunner.query(`DROP TABLE \`wallet_address_managements\``);
    }

}
