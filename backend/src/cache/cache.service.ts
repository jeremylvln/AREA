import { RedisClient, createClient } from 'redis';
import { promisify } from 'util';
import { Injectable, Logger } from '@nestjs/common';

const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_HOST = String(process.env.REDIS_HOST || '');

@Injectable()
export class CacheService {
  private redisClient: RedisClient;

  private setAsync;
  private getAsync;
  private expireAsync;
  private existsAsync;

  constructor() {
    this.redisClient = createClient(REDIS_PORT, REDIS_HOST);

    this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
    this.expireAsync = promisify(this.redisClient.expire).bind(this.redisClient);
    this.existsAsync = promisify(this.redisClient.exists).bind(this.redisClient);
  }

  async storeUserToken(owner: string, service: string, token: string, ttl: number = 60 * 60): Promise<void> {
    const key = `${owner}-${service}`;
    await this.setAsync(key, token);
    await this.expireAsync(key, ttl);
    Logger.log(`Stored token ${key}.`, "CacheService");
  }

  async getStoredUserToken(owner: string, service: string): Promise<string | null> {
    const key = `${owner}-${service}`;

    if (await this.existsAsync(key) === 0) {
      return null;
    }

    return this.getAsync(key);
  }

  async hasStoredUserToken(owner: string, service: string): Promise<boolean> {
    const key = `${owner}-${service}`;
    return await this.existsAsync(key) === 1;
  }

  async storeState(owner: string | null, service: string, name: string, value: any, ttl: number = 60 * 60): Promise<void> {
    if (!owner) {
      owner = 'global';
    }

    const key = `${owner}-${service}-${name}`;
    await this.setAsync(key, JSON.stringify(value));

    if (ttl > 0) {
      await this.expireAsync(key, ttl);
    }
    
    Logger.log(`Stored state ${key}.`, "CacheService");
  }

  async getStoredState(owner: string | null, service: string, name: string): Promise<any> {
    if (!owner) {
      owner = 'global';
    }

    const key = `${owner}-${service}-${name}`;
    return JSON.parse(await this.getAsync(key));
  }

  async hasStoredState(owner: string | null, service: string, name: string): Promise<boolean> {
    if (!owner) {
      owner = 'global';
    }

    const key = `${owner}-${service}-${name}`;
    return await this.existsAsync(key) === 1;
  }
}
