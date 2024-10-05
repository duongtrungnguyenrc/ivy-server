import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { decode } from "jsonwebtoken";
import { Socket } from "socket.io";

import { getTokenFromRequest } from "@app/utils";
import { Role } from "@app/enums";

export const SocketAuthRole = createParamDecorator((_, ctx: ExecutionContext): string => {
  const client: Socket = ctx.switchToWs().getClient();

  const authToken: string = getTokenFromRequest(client.handshake, true);

  if (!authToken) return Role.USER;

  const decodedToken = decode(authToken);

  return (decodedToken as JwtPayload)?.role || Role.USER;
});
