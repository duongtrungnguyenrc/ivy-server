import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

import { JwtRefreshService } from "@app/services";
import { getTokenFromRequest } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class JWTRefreshAuthGuard extends AuthGuard("jwt-refresh") {
  constructor(private readonly jwtRefreshService: JwtRefreshService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(_: any, user: any, __: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authToken = getTokenFromRequest(request);

    if (!authToken || !this.jwtRefreshService.isRevoked(authToken))
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    return user;
  }
}
