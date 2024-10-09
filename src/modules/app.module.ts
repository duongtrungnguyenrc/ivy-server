import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { Keyv } from "keyv";
import KeyvRedis from "@keyv/redis";

import { CollectionGroupModule } from "./collection-group.module";
import { CollectionModule } from "./collection.module";
import { CategoryModule } from "./category.module";
import { TestController } from "@app/controllers";
import { ProductModule } from "./product.module";
import { RatingModule } from "./rating.module";
import { ContactModule } from "./chat.module";
import { OrderModule } from "./order.module";
import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import { CartModule } from "./cart.module";

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
    ContactModule,
    RatingModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return new Keyv({
          store: new KeyvRedis(configService.get<string>("REDIS_URL"), {
            ttl: async () => configService.get<number>("REDIS_TTL"),
          }),
        });
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
