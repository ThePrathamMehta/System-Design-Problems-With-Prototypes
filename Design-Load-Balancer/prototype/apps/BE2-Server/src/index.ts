import express, { type Request, type Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from backend server 2');
});

app.listen(process.env.BE2_PORT, () => {
  console.log('server running');
});
