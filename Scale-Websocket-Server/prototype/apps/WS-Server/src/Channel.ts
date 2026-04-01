import type { User } from './User';
import { events } from '@repo/ws-events';

export class Channel {
  channelId: string;
  private users: Map<string, User>;
  messages: string[];

  constructor(channeId: string) {
    this.channelId = channeId;
    this.users = new Map();
    this.messages = [];
  }

  addUser(user: User) {
    this.users.set(user.userId, user);
  }

  broadCast(message: string) {
    this.messages.push(message);
    this.users.forEach((user) => {
      if (user.socket.readyState == WebSocket.OPEN) {
        user.socket.send(
          JSON.stringify({
            type: events.MESSAGE,
            message,
          })
        );
      }
    });
  }
}
