import {MigrationInterface, QueryRunner} from "typeorm";

export class balanceConfig1709628484018 implements MigrationInterface {
    name = 'balanceConfig1709628484018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`balance_configurations\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`asset_id\` varchar(36) NOT NULL, \`manager_id\` varchar(36) NULL, \`balance\` decimal(30,15) NOT NULL DEFAULT '0.000000000000000', UNIQUE INDEX \`IDX_7c48b65225c75efb93b25c004b\` (\`asset_id\`, \`manager_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`balance_configurations\` ADD CONSTRAINT \`FK_8b7a8a7888033c119f3be71aa31\` FOREIGN KEY (\`asset_id\`) REFERENCES \`assets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`balance_configurations\` ADD CONSTRAINT \`FK_8a3b15526e3103636d95dc207ee\` FOREIGN KEY (\`manager_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`balance_configurations\` DROP FOREIGN KEY \`FK_8a3b15526e3103636d95dc207ee\``);
        await queryRunner.query(`ALTER TABLE \`balance_configurations\` DROP FOREIGN KEY \`FK_8b7a8a7888033c119f3be71aa31\``);
        await queryRunner.query(`DROP INDEX \`IDX_7c48b65225c75efb93b25c004b\` ON \`balance_configurations\``);
        await queryRunner.query(`DROP TABLE \`balance_configurations\``);
    }

}
