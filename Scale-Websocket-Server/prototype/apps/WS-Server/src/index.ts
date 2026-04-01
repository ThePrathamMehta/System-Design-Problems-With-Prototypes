import Redis from 'ioredis';
import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { UserManager } from './managers/UserManager';

const wss = new WebSocketServer({ port: 8000 });

const userManager = UserManager.getInstance();

const subscriber = new Redis(process.env.REDIS_URI!);

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const url = new URL(req.url!, 'http://localhost');
  const userId = url.searchParams.get('userId');
  if(!userId) {
    ws.send(JSON.stringify({
        message : "please send the userId"
    }))
    ws.close();
    return ;
  }
  userManager.addUser(userId,ws);
});
