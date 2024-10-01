import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { decode } from "jsonwebtoken";
import { Socket } from "socket.io";

import { getTokenFromRequest } from "@app/utils";

export const SocketAuthUid = createParamDecorator((_, ctx: ExecutionContext): string => {
  const client: Socket = ctx.switchToWs().getClient();

  const authToken: string = getTokenFromRequest(client.handshake);

  if (!authToken) return;

  const decodedToken = decode(authToken);

  return (decodedToken as JwtPayload)?.userId;
});
