import {MigrationInterface, QueryRunner} from "typeorm";

export class referral1697683889984 implements MigrationInterface {
    name = 'referral1697683889984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`referrals\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`inviter_id\` varchar(36) NOT NULL, \`invitee_id\` varchar(36) NOT NULL, \`status\` enum ('PENDING', 'REDEEMED') NOT NULL DEFAULT 'PENDING', \`order_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_a7d0bff0350dce892edbe01d1e\` (\`invitee_id\`, \`inviter_id\`), UNIQUE INDEX \`REL_ee5d5ae02ab940b485ddea1e8e\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`referral_code\` varchar(8) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_ba10055f9ef9690e77cf6445cb\` (\`referral_code\`)`);
        await queryRunner.query(`ALTER TABLE \`referrals\` ADD CONSTRAINT \`FK_4027e13ff4ec739b20403d1762b\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`referrals\` ADD CONSTRAINT \`FK_8944c646adc9219296927ba7efe\` FOREIGN KEY (\`invitee_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`referrals\` ADD CONSTRAINT \`FK_ee5d5ae02ab940b485ddea1e8e7\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`referrals\` DROP FOREIGN KEY \`FK_ee5d5ae02ab940b485ddea1e8e7\``);
        await queryRunner.query(`ALTER TABLE \`referrals\` DROP FOREIGN KEY \`FK_8944c646adc9219296927ba7efe\``);
        await queryRunner.query(`ALTER TABLE \`referrals\` DROP FOREIGN KEY \`FK_4027e13ff4ec739b20403d1762b\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_ba10055f9ef9690e77cf6445cb\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`referral_code\``);
        await queryRunner.query(`DROP INDEX \`REL_ee5d5ae02ab940b485ddea1e8e\` ON \`referrals\``);
        await queryRunner.query(`DROP INDEX \`IDX_a7d0bff0350dce892edbe01d1e\` ON \`referrals\``);
        await queryRunner.query(`DROP TABLE \`referrals\``);
    }

}
