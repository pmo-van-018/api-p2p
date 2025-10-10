import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { Event } from '@base/queues/Event';
import { EventEmitter } from '@base/queues/EventEmitter';
import { Kafka, Message, Producer } from 'kafkajs';
import { Service } from 'typedi';

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

@Service()
export class KafkaEventEmitter implements EventEmitter {
  private readonly producer: Producer;

  constructor(@Logger(__filename) private readonly log: LoggerInterface) {
    this.producer = this.createProducer();
    this.connectToKafka();
    this.registerGracefulShutdown();
  }

  public async emit(event: Event) {
    try {
      const { topic, key, value, headers } = event;
      await this.producer.send({
        topic,
        messages: [{ key, value, headers }],
      });
    } catch (error) {
      this.log.error('Kafka producer send error', error);
      throw error;
    }
  }

  public async batchEmit(events: Event[]) {
    try {
      // group events by topic
      const groupedEvents = events.reduce((acc, curr) => {
        if (!acc[curr.topic]) {
          acc[curr.topic] = [];
        }
        acc[curr.topic].push(curr);
        return acc;
      }, {});

      const messages = Object.entries(groupedEvents)
        .map(([topic, items]) => {
          if (!Array.isArray(items) || !items?.length) {
            return null;
          }
          return {
            topic,
            messages: items.map(({ key, value, headers }) => ({ key, value, headers } as Message)),
          };
        })
        .filter(Boolean);

      await this.producer.sendBatch({
        topicMessages: messages.map(({ topic, messages: messageBatch }) => ({ topic, messages: messageBatch })),
      });
    } catch (error) {
      this.log.error('Kafka producer send batch error', error);
      throw error;
    }
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: env.kafka.clientId,
      brokers: [...env.kafka.brokers],
    });
    return kafka.producer();
  }

  public connectToKafka() {
    return this.producer.connect();
  }

  private registerGracefulShutdown() {
    errorTypes.forEach((type) => {
      process.on(type, async () => {
        try {
          this.log.error(`process.on ${type}`);
          await this.producer.disconnect();
          this.log.error('Kafka producer disconnected');
        } catch (_) {
          this.log.error('Kafka producer disconnect error');
        }
      });
    });

    signalTraps.forEach((type) => {
      process.once(type, async () => {
        try {
          this.log.info(`process.once ${type}`);
          await this.producer.disconnect();
          this.log.error('Kafka producer disconnected');
        } finally {
          process.kill(process.pid, type);
        }
      });
    });
  }
}
