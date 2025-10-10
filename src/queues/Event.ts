import { v4 } from 'uuid';

export class Event {
  /**
   * Destination topic
   */
  public topic: string;

  /**
   * Unique key of the event, usefull for deduplication or partitioning
   */
  public key: string;

  /**
   * Value of the event
   */
  public value: string;

  /**
   * Headers of the event
   */
  public headers?: Record<string, string>;

  constructor(data: { topic: string; value: string; key?: string; headers?: Record<string, string> }) {
    const { topic, value, key, headers } = data;
    this.topic = topic;
    this.value = value;
    this.headers = headers;
    // If key is not provided, generate a new one, just for safety
    this.key = key || v4();
  }
}
