import {MigrationInterface, QueryRunner} from "typeorm";

export class paymentTicket1735352736195 implements MigrationInterface {
    name = 'paymentTicket1735352736195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payment_tickets\` (\`id\` varchar(36) NOT NULL, \`order_id\` varchar(255) NOT NULL, \`note\` varchar(255) NOT NULL, \`receiver\` varchar(255) NOT NULL, \`bank_no\` varchar(255) NOT NULL, \`gateway\` varchar(255) NOT NULL, \`payment_method_id\` varchar(255) NOT NULL, \`amount\` decimal(27,8) NOT NULL, \`type\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL, \`credit_draw_by\` varchar(255) NOT NULL, \`credit_draw_at\` datetime NULL, \`cancelled_at\` datetime NULL, \`picked_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` ADD CONSTRAINT \`FK_2325d0b9854fda1d55c962a14a1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` ADD CONSTRAINT \`FK_5962afc4f672e9cdf3989de6cd9\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` DROP FOREIGN KEY \`FK_5962afc4f672e9cdf3989de6cd9\``);
        await queryRunner.query(`ALTER TABLE \`payment_tickets\` DROP FOREIGN KEY \`FK_2325d0b9854fda1d55c962a14a1\``);
        await queryRunner.query(`DROP TABLE \`payment_tickets\``);
    }

}
