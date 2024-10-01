import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { CacheModule } from "@nestjs/cache-manager";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { CollectionModule } from "./collection.module";
import { TestController } from "@app/controllers";
import { ProductModule } from "./product.module";
import { CollectionGroupModule } from "./collection-group.module";
import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import { CategoryModule } from "./category.module";
import { OrderModule } from "./order.module";
import { CartModule } from "./cart.module";
import { ChatModule } from "./chat.module";

@Module({
  imports: [
    UserModule,
    AuthModule,
    CategoryModule,
    CollectionGroupModule,
    CollectionModule,
    ProductModule,
    CartModule,
    OrderModule,
    ChatModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          store: redisStore,
          url: configService.get<string>("REDIS_URL"),
          ttl: configService.get<number>("REDIS_TTL"),
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
