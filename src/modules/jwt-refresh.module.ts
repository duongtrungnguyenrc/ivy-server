import { ConfigService } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { JwtRefreshService } from "@app/services";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_REFRESH_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_REFRESH_TTL"),
          },
        };
      },
    }),
  ],
  providers: [JwtRefreshService],
  exports: [JwtRefreshService],
})
export class JwtRefreshModule {}
