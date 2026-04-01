import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import Redis from "ioredis";

const __dirname = import.meta.dir;

export const kafka = new Kafka({
  clientId: 'Scale-Socket',
  brokers: [process.env.KAFKA_BROKER_URI!],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, 'constants/configuration/ca.pem'), 'utf-8')],
    cert: fs.readFileSync(path.join(__dirname, 'constants/configuration/service.cert'), 'utf-8'),
    key: fs.readFileSync(path.join(__dirname, 'constants/configuration/service.key'), 'utf-8'),
  },
});

const redis = new Redis(process.env.REDIS_URI!);

const consumer = kafka.consumer({ groupId: 'messaging-worker' });

async function start() {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'messages',
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value?.toString()!);
      await redis.publish(
        `channel:${event.channel_id}`,
        JSON.stringify(event)
      )
    },
  });
}

start();
