import { UnauthorizedException } from "@nestjs/common";
import { Handshake } from "socket.io/dist/socket";
import { Request } from "express";

import { TOKEN_TYPE } from "@app/constants";
import { ErrorMessage } from "@app/enums";
import { WsException } from "@nestjs/websockets";

const extractAuthToken = (fullToken: string, raw: boolean = false) => {
  const [tokenType, authToken] = fullToken?.split(" ") ?? [];

  if ((!tokenType || tokenType !== TOKEN_TYPE || !authToken) && !raw) {
    throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);
  }

  return authToken;
};

export const getTokenFromRequest = (request: Request, raw: boolean = false): string => {
  const fullToken = request.headers["authorization"];

  if (!fullToken && !raw) {
    if (request instanceof Request) throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);
    throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);
  }

  return extractAuthToken(fullToken, raw);
};

export const getTokenFromHandshake = (handshake: Handshake, raw: boolean = false): string => {
  const fullToken: string = handshake.auth?.token;

  if (!fullToken) {
    throw new WsException(ErrorMessage.INVALID_AUTH_TOKEN);
  }

  return extractAuthToken(fullToken, raw);
};
