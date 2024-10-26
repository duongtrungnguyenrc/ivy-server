import { Inject, Injectable } from "@nestjs/common";
import { Keyv } from "keyv";

import { CACHE_PROVIDE } from "@app/constants";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_PROVIDE) private readonly keyv: Keyv) {}

  async get<T>(key: string): Promise<T> {
    return (await this.keyv.get(key)) as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.keyv.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.keyv.delete(key);
  }
}
