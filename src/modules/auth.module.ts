import { AuthService } from "@app/services";
import { Module } from "@nestjs/common";

import { LocalStrategy, JwtAccessStrategy, JwtRefreshStrategy } from "@app/strategies";
import { JwtRefreshModule } from "./jwt-refresh.module";
import { JwtAccessModule } from "./jwt-access.module";
import { AuthController } from "@app/controllers";
import { MailModule } from "./mailer.module";
import { UserModule } from "./user.module";
@Module({
  imports: [JwtAccessModule, JwtRefreshModule, UserModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
