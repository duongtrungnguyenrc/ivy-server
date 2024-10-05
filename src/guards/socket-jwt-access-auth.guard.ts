import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { Observable } from "rxjs";

import { JwtAccessService } from "@app/services";
import { getTokenFromRequest } from "@app/utils";

@Injectable()
export class SocketJWTAccessAuthGuard implements CanActivate {
  constructor(private readonly jwtAccessService: JwtAccessService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const authToken: string = getTokenFromRequest(client.handshake);

    if (!authToken) return false;

    return this.jwtAccessService.verifyToken(authToken);
  }
}
