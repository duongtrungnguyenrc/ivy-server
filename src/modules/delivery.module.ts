import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { DeliveryService } from "@app/services";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          baseURL: configService.get<string>("GHN_SHIPPING_URL"),
          headers: {
            ShopId: configService.get<number>("GHN_SHOP_ID"),
            Token: configService.get<string>("GHN_API_TOKEN"),
            "Content-Type": "application/json; text/plain",
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
