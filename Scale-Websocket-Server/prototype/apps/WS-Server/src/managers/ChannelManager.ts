import { Channel } from '../Channel';
import { subscriber } from '../lib/subscriber';
import type { User } from '../User';

export class ChannelManager {
  channels: Map<string, Channel>;
  static instance: ChannelManager;

  constructor() {
    this.channels = new Map();
  }

  static getInstance() {
    if (ChannelManager.instance) return ChannelManager.instance;
    ChannelManager.instance = new ChannelManager();
    return ChannelManager.instance;
  }

  addUserToChannel(channel_id: string, user: User) {
    if (!this.channels.has(channel_id)) {
      this.channels.set(channel_id, new Channel(channel_id));
      // Subscribe to Redis Once Per Channel
      subscriber.subscribe(`channel:${channel_id}`, (err) => {
        if (err) console.error('Redis subscribe error:', err);
        else console.log(`Subscribed to channel:${channel_id}`);
      });
      this.channels.get(channel_id)!.addUser(user);
    }
  }

  initRedis() {
    subscriber.on('message', (redisChannel, message) => {
      const channel_id = redisChannel.replace('channel:', '');
      const channel = this.channels.get(channel_id);
      if (!channel) return;
    });
  }
}
