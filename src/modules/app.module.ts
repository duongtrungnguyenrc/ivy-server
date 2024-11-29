import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { CollectionGroupModule } from "./collection-group.module";
import { GlobalUserServiceMiddleware } from "@app/middlewares";
import { PaymentModule } from "@app/modules/payment.module";
import { CacheModule } from "@app/modules/cache.module";
import { CollectionModule } from "./collection.module";
import { CategoryModule } from "./category.module";
import { DeliveryModule } from "./delivery.module";
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
    PaymentModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "production" ? ".env" : ".env.dev",
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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalUserServiceMiddleware).forRoutes("*");
  }
}
