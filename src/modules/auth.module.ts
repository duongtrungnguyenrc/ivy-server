import { Module } from "@nestjs/common";

import { AuthController } from "@app/controllers";
import { AuthService } from "@app/services";
import { LocalStrategy, JwtAccessStrategy, JwtRefreshStrategy } from "@app/strategies";
import { JwtAccessModule } from "./jwt-access.module";
import { JwtRefreshModule } from "./jwt-refresh.module";
import { UserModule } from "./user.module";
import { MailModule } from "./mailer.module";

@Module({
  imports: [JwtAccessModule, JwtRefreshModule, UserModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, LocalStrategy],
})
export class AuthModule {}
