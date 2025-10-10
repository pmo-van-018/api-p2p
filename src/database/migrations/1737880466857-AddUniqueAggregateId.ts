import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUniqueAggregateId1737880466857 implements MigrationInterface {
    name = 'AddUniqueAggregateId1737880466857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`outbox\` ADD UNIQUE INDEX \`IDX_31cf6b77b1536c6d41681a3b16\` (\`aggregate_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`outbox\` DROP INDEX \`IDX_31cf6b77b1536c6d41681a3b16\``);
    }

}
