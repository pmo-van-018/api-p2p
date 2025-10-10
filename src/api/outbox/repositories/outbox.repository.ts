import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { OutBox } from '@api/outbox/models/OutBox';
import moment from 'moment';
import { EntityRepository } from 'typeorm';

@EntityRepository(OutBox)
export class OutBoxRepository extends RepositoryBase<OutBox> {
  public async fetchMessages(limit?: number): Promise<any> {
    const query =
      limit !== undefined
        ? `SELECT * FROM outbox WHERE sent_at IS NULL ORDER BY created_at ASC LIMIT ? FOR UPDATE SKIP LOCKED`
        : `SELECT * FROM outbox WHERE sent_at IS NULL ORDER BY created_at ASC FOR UPDATE SKIP LOCKED`;

    const params = limit !== undefined ? [limit] : [];
    return this.query(query, params);
  }

  public async markAsSent(outboxes: OutBox[]): Promise<void> {
    const now = moment().utc().toDate();
    outboxes.forEach((outbox) => {
      outbox.sentAt = now;
    });
    await this.save(outboxes);
  }
}
