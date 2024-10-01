import { UnauthorizedException } from "@nestjs/common";
import { Handshake } from "socket.io/dist/socket";
import { Request } from "express";

import { TOKEN_TYPE } from "@app/constants";
import { ErrorMessage } from "@app/enums";

export const getTokenFromRequest = (request: Request | Handshake, raw: boolean = false): string => {
  const authorizationHeader = request.headers["authorization"];

  if (!authorizationHeader && !raw) {
    throw new UnauthorizedException("Authorization header missing!");
  }

  const [tokenType, authToken] = authorizationHeader?.split(" ") ?? [];

  if ((!tokenType || tokenType !== TOKEN_TYPE || !authToken) && !raw) {
    throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);
  }

  return authToken;
};
