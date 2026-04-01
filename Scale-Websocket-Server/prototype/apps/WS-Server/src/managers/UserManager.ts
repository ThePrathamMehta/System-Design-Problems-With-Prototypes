import type WebSocket from 'ws';
import { User } from '../User';

export class UserManager {
  private users: Map<string, User>;
  static instance: UserManager;

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new UserManager();
    return this.instance;
  }

  constructor() {
    this.users = new Map();
  }

  addUser(userId: string, ws: WebSocket) {
    if (this.users.has(userId)) return;
    this.users.set(userId, new User(userId, ws));
  }
}
