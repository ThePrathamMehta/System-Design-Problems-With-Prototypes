import express, { type Request, type Response } from 'express';
import cors from 'cors';
import ChannelRouter from './routes/channel.routes';
import MessageRouter from './routes/message.routes';
import { connectProducer } from './lib/kafka';

async function main() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await connectProducer();

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello');
  });

  app.use('/api/channels', ChannelRouter);
  app.use('/api/message', MessageRouter);

  app.listen(process.env.PORT || 3001, () => {
    console.log('running');
  });
}

main();
