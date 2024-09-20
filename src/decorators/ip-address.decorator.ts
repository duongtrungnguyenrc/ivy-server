import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const IpAddress = createParamDecorator((_, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  const ip =
    request.headers["x-forwarded-for"] ||
    request.connection?.remoteAddress ||
    request.socket?.remoteAddress ||
    request.connection?.socket?.remoteAddress;

  return Array.isArray(ip) ? ip[0] : ip;
});
