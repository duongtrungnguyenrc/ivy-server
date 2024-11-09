import { Inject, Injectable } from "@nestjs/common";
import { Keyv } from "keyv";

import { CACHE_PROVIDE } from "@app/constants";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_PROVIDE) private readonly keyv: Keyv) {}

  async get<T>(key: string): Promise<T> {
    return await this.keyv.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.keyv.set(key, value, ttl);
  }

  async del(regex: RegExp, prefix?: string): Promise<void>;
  async del(key: string): Promise<void>;
  async del(keyOrPattern: string | RegExp, prefix?: string): Promise<void> {
    if (keyOrPattern instanceof RegExp) {
      await this.deleteKeysByRegex(keyOrPattern, prefix);
    } else {
      await this.keyv.delete(keyOrPattern);
    }
  }

  private async deleteKeysByRegex(regex: RegExp, prefix?: string): Promise<void> {
    const redisClient = this.keyv.opts.store['redis'];
    const namespace: string = this.keyv.opts.store.namespace;
    const matchingKeys: string[] = [];
    let cursor: string = "0";

    do {
      const scanResult: [string, Array<string>] = await redisClient.scan(cursor, "MATCH", `*${prefix}*`, "COUNT", 100);
      cursor = scanResult[0];
      const keys: Array<string> = scanResult[1];

      matchingKeys.push(...keys.filter((key: string) => regex.test(key)));
    } while (cursor !== "0");

    await Promise.all(matchingKeys.map((key: string) => this.del(key.replace(`${namespace}:`, ""))));
  }
}
