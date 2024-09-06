import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { RoleType } from "@app/decorators";

@Injectable()
export class JWTAccessAuthGuard extends AuthGuard("jwt-access") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException("Authentication failed");
    }

    const roles = this.reflector.get<RoleType[]>("roles", context.getHandler());

    if (!roles || roles.includes("*")) {
      return user;
    }

    const userRole = user.role;

    if (!roles.includes(userRole)) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }

    return user;
  }
}
