import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { CacheModule } from "@nestjs/cache-manager";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { TestController } from "@app/controllers";
import { AuthModule } from "./auth.module";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          store: redisStore,
          url: configService.get<string>("REDIS_URL"),
        };
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>("MONGO_CONNECTION_URL"),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [TestController],
  providers: [],
})
export class AppModule {}
