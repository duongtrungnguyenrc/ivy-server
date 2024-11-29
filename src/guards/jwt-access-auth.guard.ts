import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { JwtAccessService } from "@app/services";
import { getTokenFromRequest } from "@app/utils";
import { ValidRole } from "@app/decorators";
import { ErrorMessage, Role } from "@app/enums";

@Injectable()
export class JWTAccessAuthGuard extends AuthGuard("jwt-access") {
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
    const request = context.switchToHttp().getRequest();
    const authToken = getTokenFromRequest(request);

    if (!authToken || !this.jwtAccessService.isRevoked(authToken))
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    const roles = this.reflector.get<ValidRole[]>("roles", context.getHandler());

    const decodedToken: JwtPayload = this.jwtAccessService.decodeToken(authToken);

    if (!decodedToken) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    if (!roles || roles.includes("*")) {
      return user;
    }

    if (decodedToken.role != Role.OWNER && !roles.includes(decodedToken.role)) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN);
    }

    return user;
  }
}
