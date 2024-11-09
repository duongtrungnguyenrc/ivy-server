import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Socket } from "socket.io";
import { Observable } from "rxjs";

import { getTokenFromHandshake } from "@app/utils";
import { JwtAccessService } from "@app/services";
import { WsException } from "@nestjs/websockets";
import { ValidRole } from "@app/decorators";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class JWTSocketAuthGuard extends AuthGuard("jwt-socket") {
  constructor(
    private reflector: Reflector,
    private readonly jwtAccessService: JwtAccessService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(_: any, user: any, ___: any, context: ExecutionContext) {
    const roles = this.reflector.get<ValidRole[]>("roles", context.getHandler());
    const client: Socket = context.switchToWs().getClient();

    const authToken = getTokenFromHandshake(client.handshake);

    if (!authToken) throw new WsException(ErrorMessage.UNAUTHORIZED);

    const decodedToken: JwtPayload = this.jwtAccessService.decodeToken(authToken);

    if (!roles || roles.includes("*")) {
      return user;
    }

    if (!roles.includes(decodedToken?.role)) {
      throw new WsException(ErrorMessage.FORBIDDEN);
    }

    return user;
  }
}
