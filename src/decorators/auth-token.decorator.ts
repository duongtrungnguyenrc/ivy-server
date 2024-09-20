import { ErrorMessage } from "@app/enums";
import { getTokenFromRequest } from "@app/utils";
import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const AuthToken = createParamDecorator((_, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  const authToken: string = getTokenFromRequest(request, true);

  if (!authToken) throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);

  return authToken;
});
