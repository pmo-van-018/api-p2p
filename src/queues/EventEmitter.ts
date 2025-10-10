import { Event } from '@base/queues/Event';

export interface EventEmitter {
  /**
   * Emit event to external queue
   *
   * @param event Event to be emitted
   */
  emit(event: Event): any;

  /**
   * Emit batch of events to external queue
   *
   * @param events Array of events to be emitted
   */
  batchEmit(events: Event[]): any;
}
