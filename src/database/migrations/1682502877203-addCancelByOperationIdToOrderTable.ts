import {MigrationInterface, QueryRunner} from "typeorm";

export class addCancelByOperationIdToOrderTable1682502877203 implements MigrationInterface {
    name = 'addCancelByOperationIdToOrderTable1682502877203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_10d3b9250270115115b3d899d1f\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`cancel_by_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`cancel_by_operation_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`cancel_by_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_3c3de5741650fdf755aba297fca\` FOREIGN KEY (\`cancel_by_operation_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_ee11c8a78ba0ae046f9475583c5\` FOREIGN KEY (\`cancel_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_ee11c8a78ba0ae046f9475583c5\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_3c3de5741650fdf755aba297fca\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`cancel_by_user_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`cancel_by_operation_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`cancel_by_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_10d3b9250270115115b3d899d1f\` FOREIGN KEY (\`cancel_by_id\`) REFERENCES \`operations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
