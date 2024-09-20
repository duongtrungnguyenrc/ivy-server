import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { decode } from "jsonwebtoken";
import { Observable } from "rxjs";

import { RoleType } from "@app/decorators";
import { getTokenFromRequest } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class JWTAccessAuthGuard extends AuthGuard("jwt-access") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(_: any, user: any, ___: any, context: ExecutionContext) {
    const roles = this.reflector.get<RoleType[]>("roles", context.getHandler());
    const request = context.switchToHttp().getRequest();

    const authToken = getTokenFromRequest(request);

    if (!authToken) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    const decodedToken: JwtPayload = decode(authToken) as JwtPayload;

    if (!roles || roles.includes("*")) {
      return user;
    }

    if (!roles.includes(decodedToken.role)) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN);
    }

    return user;
  }
}
