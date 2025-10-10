import {MigrationInterface, QueryRunner} from "typeorm";

export class removeRedundantTable1685502932327 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('drop table if exists `user_devices`');
        await queryRunner.query('drop table if exists `user_infos`');
        await queryRunner.query('drop table if exists `blockchain_credential`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        return null;
    }

}
