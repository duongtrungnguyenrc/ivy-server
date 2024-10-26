import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import KeyvRedis from "@keyv/redis";
import Keyv from "keyv";

import { CACHE_PROVIDE } from "@app/constants";
import { CacheService } from "@app/services";

@Global()
@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_PROVIDE,
          useFactory: (configService: ConfigService) => {
            return new Keyv({
              store: new KeyvRedis(configService.get<string>("REDIS_URL"), {
                ttl: async () => configService.get<number>("REDIS_TTL"),
              }),
              namespace: "root",
            });
          },
          inject: [ConfigService],
        },
        CacheService,
      ],
      exports: [CACHE_PROVIDE, CacheService],
    };
  }

  static forFeature(namespace: string): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_PROVIDE,
          useFactory: (configService: ConfigService) => {
            return new Keyv({
              store: new KeyvRedis(configService.get<string>("REDIS_URL"), {
                ttl: async () => configService.get<number>("REDIS_TTL"),
              }),
              namespace: namespace || "root",
            });
          },
          inject: [ConfigService],
        },
        CacheService,
      ],
      exports: [CACHE_PROVIDE, CacheService],
    };
  }
}
