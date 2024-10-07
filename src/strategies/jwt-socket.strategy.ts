import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

import { getTokenFromHandshake } from "@app/utils";

@Injectable()
export class JwtSocketStrategy extends PassportStrategy(Strategy, "jwt-socket") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(socket: Socket) => this.extractTokenForSocket(socket)]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: any) {
    return payload;
  }

  private extractTokenForSocket(socket: Socket): string | null {
    const authToken: string = getTokenFromHandshake(socket.handshake);

    return authToken;
  }
}
