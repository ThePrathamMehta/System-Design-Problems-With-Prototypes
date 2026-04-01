import type WebSocket from 'ws';

export class User {
  userId: string;
  socket: WebSocket;
  constructor(userId: string, socket: WebSocket) {
    this.userId = userId;
    this.socket = socket;
    this.init();
  }
  init() {
    this.socket.on('message', (message) => {
      const event = JSON.parse(message.toString());
      
    });
  }
}
