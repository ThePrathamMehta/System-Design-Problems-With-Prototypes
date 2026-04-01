import type { User } from './User';

export class Channel {
  channelId: string;
  private users: Map<string, User>;
  messages: string[];

  constructor(channeId: string) {
    this.channelId = channeId;
    this.users = new Map();
    this.messages = [];
  }
}
