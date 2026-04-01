import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dir;

export const kafka = new Kafka({
  clientId: 'Scale-Socket',
  brokers: [process.env.KAFKA_BROKER_URI!],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, '../constants/configuration/ca.pem'), 'utf-8')],
    cert: fs.readFileSync(path.join(__dirname, '../constants/configuration/service.cert'), 'utf-8'),
    key: fs.readFileSync(path.join(__dirname, '../constants/configuration/service.key'), 'utf-8'),
  },
});

export const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
}