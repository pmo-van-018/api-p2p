import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreOriginalPaymentTicketPayload1736224548284 implements MigrationInterface {
  name = 'AddStoreOriginalPaymentTicketPayload1736224548284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`payment_tickets\` ADD \`payload_log\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`payment_tickets\` DROP COLUMN \`payload_log\``);
  }
}
