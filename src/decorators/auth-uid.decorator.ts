import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { decode } from "jsonwebtoken";

import { getTokenFromRequest } from "@app/utils";

export const AuthUid = createParamDecorator((_, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  const authToken: string = getTokenFromRequest(request, true);

  const decodedToken = decode(authToken);

  return (decodedToken as JwtPayload)?.userId;
});
