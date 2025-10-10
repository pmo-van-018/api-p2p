import {MigrationInterface, QueryRunner} from "typeorm";

export class requestSupport1695627673426 implements MigrationInterface {
    name = 'requestSupport1695627673426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`support_requests\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`admin_id\` varchar(36) NULL, \`user_id\` varchar(36) NOT NULL, \`room_id\` varchar(24) NOT NULL, \`ref_id\` varchar(20) NOT NULL, \`status\` varchar(10) NOT NULL DEFAULT 'PENDING', \`type\` tinyint NOT NULL, \`completed_at\` datetime NULL, UNIQUE INDEX \`IDX_30b76297ec56955c0c4c5525e1\` (\`room_id\`), UNIQUE INDEX \`IDX_67861f066d37e75ce52dd32e8d\` (\`ref_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`support_requests\` ADD CONSTRAINT \`FK_7100a8b7952f063c5ed3f68960e\` FOREIGN KEY (\`admin_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`support_requests\` ADD CONSTRAINT \`FK_cc35b4096584fbc523e25eb7d7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`support_requests\` DROP FOREIGN KEY \`FK_cc35b4096584fbc523e25eb7d7b\``);
        await queryRunner.query(`ALTER TABLE \`support_requests\` DROP FOREIGN KEY \`FK_7100a8b7952f063c5ed3f68960e\``);
        await queryRunner.query(`DROP INDEX \`IDX_67861f066d37e75ce52dd32e8d\` ON \`support_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_30b76297ec56955c0c4c5525e1\` ON \`support_requests\``);
        await queryRunner.query(`DROP TABLE \`support_requests\``);
    }

}
