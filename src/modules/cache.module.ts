import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import KeyvRedis from "@keyv/redis";
import Keyv from "keyv";

import { CACHE_PROVIDE } from "@app/constants";
import { CacheService } from "@app/services";

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
              store: new KeyvRedis(configService.get<string>("REDIS_URL")),
              namespace: "root", // Namespace mặc định
              ttl: Number(configService.get<number>("REDIS_TTL")),
            });
          },
          inject: [ConfigService],
        },
        CacheService,
      ],
      global: true,
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
              store: new KeyvRedis(configService.get<string>("REDIS_URL")),
              namespace: namespace || "root",
              ttl: Number(configService.get<number>("REDIS_TTL")),
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
