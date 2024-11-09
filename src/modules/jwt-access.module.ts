import { ConfigService } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { JwtAccessService } from "@app/services";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_ACCESS_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_ACCESS_TTL"),
          },
        };
      },
    }),
  ],
  providers: [JwtAccessService],
  exports: [JwtAccessService],
})
export class JwtAccessModule {}
