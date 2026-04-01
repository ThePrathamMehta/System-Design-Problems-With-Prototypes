import Redis from 'ioredis';

export const subscriber = new Redis(process.env.REDIS_URI!);