import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Request } from "express";

import { JwtAccessService } from "@app/services";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(
    private readonly jwtAccessService: JwtAccessService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(request: Request): Promise<boolean> {
    const authHeader = request.headers.authorization;

    const [, accessToken] = authHeader.split(" ");

    const validateResult = this.jwtAccessService.verifyToken(accessToken);

    return validateResult;
  }
}
