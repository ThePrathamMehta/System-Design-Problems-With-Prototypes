import type WebSocket from 'ws';
import { events } from '@repo/ws-events';
import { ChannelManager } from './managers/ChannelManager';

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
      switch (event.type) {
        case events.JOIN_CHANNEL:
          const { channelId } = event.payload;
          ChannelManager.getInstance().addUserToChannel(channelId, this);
      }
    });
  }
}
