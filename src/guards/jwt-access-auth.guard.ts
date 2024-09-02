import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { decode } from "jsonwebtoken";
import { Observable } from "rxjs";
import { Request } from "express";

import { getTokenFromRequest } from "@app/utils";
import { RoleType } from "@app/decorators";

@Injectable()
export class JWTAccessAuthGuard extends AuthGuard("jwt-access") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const canActivate = super.canActivate(context);
    const roles = this.reflector?.get<RoleType[]>("roles", context.getHandler());

    console.log(this.reflector);

    if (!roles || roles.includes("*")) {
      return canActivate;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token: string = getTokenFromRequest(request);

    const decodedToken: JwtPayload = decode(token) as JwtPayload;

    if (!roles.includes(decodedToken.role)) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }

    return canActivate;
  }
}
