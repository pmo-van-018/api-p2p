import {MigrationInterface, QueryRunner} from "typeorm";

export class adjustmentRate1727340673086 implements MigrationInterface {
    name = 'adjustmentRate1727340673086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`public_view_adjustments\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`manager_id\` varchar(36) NOT NULL, \`total_order_completed\` int NOT NULL DEFAULT '0', \`total_rate_completed\` decimal(27,8) NOT NULL DEFAULT '0.00000000', UNIQUE INDEX \`IDX_37edc81114970a60b5e36b7e73\` (\`manager_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`public_view_adjustments\` ADD CONSTRAINT \`FK_37edc81114970a60b5e36b7e735\` FOREIGN KEY (\`manager_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`public_view_adjustments\` DROP FOREIGN KEY \`FK_37edc81114970a60b5e36b7e735\``);
        await queryRunner.query(`DROP INDEX \`IDX_37edc81114970a60b5e36b7e73\` ON \`public_view_adjustments\``);
        await queryRunner.query(`DROP TABLE \`public_view_adjustments\``);
    }
}

