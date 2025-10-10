import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateOperationTableAndUpdateUserTable1682068382292 implements MigrationInterface {
    name = 'CreateOperationTableAndUpdateUserTable1682068382292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_03deebc191bbb5b9fd4b30abffc\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_0508428800471716ac1b165df29\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4cd42f51b1f3ec6d3622bb77e6f\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_10d3b9250270115115b3d899d1f\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2474866c8f8e9196ff227a7cbbd\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_316f906335ce15e2848af3dd53a\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_717ca4859d98ff25cb6b2a1e849\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP FOREIGN KEY \`FK_63efba62dab55e4d91f42fcbaca\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP FOREIGN KEY \`FK_c94cf2183ecf06b5909ecd339e1\``);
        await queryRunner.query(`DROP INDEX \`IDX_03deebc191bbb5b9fd4b30abff\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_e88e5acc0b2b1fe49328df6ed0\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_03deebc191bbb5b9fd4b30abff\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_f0b696b5d7c28733b2917bfb25\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\``);
        await queryRunner.query(`CREATE TABLE \`operations\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`wallet_address\` varchar(255) NULL, \`type\` tinyint NOT NULL DEFAULT '4', \`merchant_level\` int NULL DEFAULT '1', \`merchant_manager_id\` varchar(36) NULL, \`contract_from\` datetime NULL, \`contract_to\` datetime NULL, \`nick_name\` varchar(255) NULL, \`statistic_id\` varchar(36) NULL, \`lock_end_time\` datetime NULL, \`skip_note_at\` datetime NULL, \`activated_at\` datetime NULL, \`last_login_at\` datetime NULL, \`status\` tinyint NOT NULL DEFAULT '1', \`allow_notification\` text NULL, FULLTEXT INDEX \`IDX_572630a8efa6a7a062b2febff5\` (\`nick_name\`), UNIQUE INDEX \`IDX_3b07f9c2466f3fe839448e2c2c\` (\`wallet_address\`), UNIQUE INDEX \`REL_202de5e6e76c5ce0b20c8c9925\` (\`statistic_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`actived_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`contract_from\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`contract_to\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`merchant_level\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`merchant_manager_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`user_info_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`winner_id\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` ADD \`operation_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` ADD \`operation_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`activated_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`operation_winner_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`user_winner_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` ADD \`operation_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` DROP FOREIGN KEY \`FK_e73f283b2e2b842b231ede5e4af\``);
        await queryRunner.query(`ALTER TABLE \`notification_users\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`type\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`CREATE INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\` (\`asset_id\`, \`status\`, \`type\`)`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` ADD CONSTRAINT \`FK_e73f283b2e2b842b231ede5e4af\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` ADD CONSTRAINT \`FK_ee50e660fc4d6914687bedb55dc\` FOREIGN KEY (\`operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2474866c8f8e9196ff227a7cbbd\` FOREIGN KEY (\`merchant_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_316f906335ce15e2848af3dd53a\` FOREIGN KEY (\`supporter_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_10d3b9250270115115b3d899d1f\` FOREIGN KEY (\`cancel_by_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_717ca4859d98ff25cb6b2a1e849\` FOREIGN KEY (\`merchant_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD CONSTRAINT \`FK_096ce231b76a0d7f564ea293ed3\` FOREIGN KEY (\`merchant_manager_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD CONSTRAINT \`FK_16da9bef72d9b8a3c6812df5134\` FOREIGN KEY (\`merchant_level\`) REFERENCES \`master_data_levels\`(\`merchant_level\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`operations\` ADD CONSTRAINT \`FK_202de5e6e76c5ce0b20c8c9925c\` FOREIGN KEY (\`statistic_id\`) REFERENCES \`statistics\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD CONSTRAINT \`FK_436055c1d5e39dcfc3237f4d732\` FOREIGN KEY (\`operation_winner_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD CONSTRAINT \`FK_9a1c6bceb8012f5d58ba5d891af\` FOREIGN KEY (\`user_winner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD CONSTRAINT \`FK_63efba62dab55e4d91f42fcbaca\` FOREIGN KEY (\`admin_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP FOREIGN KEY \`FK_63efba62dab55e4d91f42fcbaca\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP FOREIGN KEY \`FK_9a1c6bceb8012f5d58ba5d891af\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP FOREIGN KEY \`FK_436055c1d5e39dcfc3237f4d732\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP FOREIGN KEY \`FK_202de5e6e76c5ce0b20c8c9925c\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP FOREIGN KEY \`FK_16da9bef72d9b8a3c6812df5134\``);
        await queryRunner.query(`ALTER TABLE \`operations\` DROP FOREIGN KEY \`FK_096ce231b76a0d7f564ea293ed3\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_717ca4859d98ff25cb6b2a1e849\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_10d3b9250270115115b3d899d1f\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_316f906335ce15e2848af3dd53a\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2474866c8f8e9196ff227a7cbbd\``);
        await queryRunner.query(`ALTER TABLE \`notification_users\` DROP FOREIGN KEY \`FK_ee50e660fc4d6914687bedb55dc\``);
        await queryRunner.query(`ALTER TABLE \`notification_users\` DROP FOREIGN KEY \`FK_e73f283b2e2b842b231ede5e4af\``);
        await queryRunner.query(`DROP INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`type\` decimal(2,1) NOT NULL DEFAULT '1.0'`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_users\` ADD CONSTRAINT \`FK_e73f283b2e2b842b231ede5e4af\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`statistics\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`volume\` DROP COLUMN \`operation_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`user_winner_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`operation_winner_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`activated_at\``);
        await queryRunner.query(`ALTER TABLE \`notification_users\` DROP COLUMN \`operation_id\``);
        await queryRunner.query(`ALTER TABLE \`statistics\` DROP COLUMN \`operation_id\``);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`winner_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`user_info_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`merchant_manager_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`merchant_level\` int NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`contract_to\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`contract_from\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`actived_at\` datetime NULL`);
        await queryRunner.query(`DROP INDEX \`REL_202de5e6e76c5ce0b20c8c9925\` ON \`operations\``);
        await queryRunner.query(`DROP INDEX \`IDX_3b07f9c2466f3fe839448e2c2c\` ON \`operations\``);
        await queryRunner.query(`DROP INDEX \`IDX_572630a8efa6a7a062b2febff5\` ON \`operations\``);
        await queryRunner.query(`DROP TABLE \`operations\``);
        await queryRunner.query(`CREATE INDEX \`IDX_908d097b95c3b81bce4115f36c\` ON \`posts\` (\`status\`, \`type\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f0b696b5d7c28733b2917bfb25\` ON \`orders\` (\`appeal_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_03deebc191bbb5b9fd4b30abff\` ON \`users\` (\`user_info_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_e88e5acc0b2b1fe49328df6ed0\` ON \`users\` (\`statistic_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_03deebc191bbb5b9fd4b30abff\` ON \`users\` (\`user_info_id\`)`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD CONSTRAINT \`FK_c94cf2183ecf06b5909ecd339e1\` FOREIGN KEY (\`winner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD CONSTRAINT \`FK_63efba62dab55e4d91f42fcbaca\` FOREIGN KEY (\`admin_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_717ca4859d98ff25cb6b2a1e849\` FOREIGN KEY (\`merchant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_316f906335ce15e2848af3dd53a\` FOREIGN KEY (\`supporter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2474866c8f8e9196ff227a7cbbd\` FOREIGN KEY (\`merchant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_10d3b9250270115115b3d899d1f\` FOREIGN KEY (\`cancel_by_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4cd42f51b1f3ec6d3622bb77e6f\` FOREIGN KEY (\`merchant_manager_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_0508428800471716ac1b165df29\` FOREIGN KEY (\`merchant_level\`) REFERENCES \`master_data_levels\`(\`merchant_level\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_03deebc191bbb5b9fd4b30abffc\` FOREIGN KEY (\`user_info_id\`) REFERENCES \`user_infos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
