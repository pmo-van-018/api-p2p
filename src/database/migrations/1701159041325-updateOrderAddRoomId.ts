import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOrderAddRoomId1699936215597 implements MigrationInterface {
    name = 'updateOrderAddRoomId1699936215597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // add room_id column to orders table
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`room_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD UNIQUE INDEX \`IDX_75d01c582622d1e1b1d8b8c124\` (\`room_id\`)`);

        // move room_id from appeals to orders
        await queryRunner.query(`
            UPDATE orders o
            INNER JOIN appeals a ON a.id = o.appeal_id
            SET o.room_id = a.room_id
            WHERE 1 = 1;
        `);

        // drop column
        await queryRunner.query(`ALTER TABLE \`appeals\` DROP COLUMN \`room_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appeals\` ADD \`room_id\` varchar(36) NULL`);

        // move room_id from orders to appeals
        await queryRunner.query(`
            UPDATE appeals a
            INNER JOIN orders o ON a.id = o.appeal_id
            SET a.room_id = o.room_id
            WHERE 1 = 1;
        `);

        await queryRunner.query(`ALTER TABLE \`orders\` DROP INDEX \`IDX_75d01c582622d1e1b1d8b8c124\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`room_id\``);
    }

}
