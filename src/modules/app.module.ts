import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { CollectionGroupModule } from "./collection-group.module";
import { CollectionModule } from "./collection.module";
import { CategoryModule } from "./category.module";
import { DeliveryModule } from "./delivery.module";
import { TestController } from "@app/controllers";
import { ProductModule } from "./product.module";
import { RatingModule } from "./rating.module";
import { ContactModule } from "./chat.module";
import { OrderModule } from "./order.module";
import { CacheModule } from "./cache.module";
import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import { CartModule } from "./cart.module";

@Module({
  imports: [
    CacheModule.forRoot(),
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
    DeliveryModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
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
})
export class AppModule {}
