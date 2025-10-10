import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'outbox' })
export class OutBox {
  /**
   * Unique identifier for the outbox message
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Date and time when the outbox message was created
   */
  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  /**
   * Date and time when the outbox message was sent
   */
  @Column({ name: 'sent_at', nullable: true })
  public sentAt: Date;

  /**
   * Topic where the outbox message will be published
   */
  @Column({ name: 'topic' })
  public topic: string;

  /**
   * Event type of the outbox message
   */
  @Column({ name: 'event_type' })
  public eventType: string;

  /**
   * Aggregate identifier
   */
  @Column({ name: 'aggregate_id', unique: true })
  public aggregateId: string;

  /**
   * Payload of the outbox message
   */
  @Column({ name: 'payload', type: 'text' })
  public payload: string;

  public static create(data: { topic: string; eventType: string; aggregateId: string; payload: string }): OutBox {
    const { topic, eventType, aggregateId, payload } = data;
    const outbox = new OutBox();
    outbox.topic = topic;
    outbox.eventType = eventType;
    outbox.aggregateId = aggregateId;
    outbox.payload = payload;
    return outbox;
  }
}
