import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Request } from "express";

import { JwtRefreshService } from "@app/services";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly jwtRefreshService: JwtRefreshService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    const authHeader = request.headers.authorization;

    const [, refreshToken] = authHeader.split(" ");

    const validateResult = this.jwtRefreshService.verifyToken(refreshToken);

    return validateResult;
  }
}
