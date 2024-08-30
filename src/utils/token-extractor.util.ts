import { UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

import { TOKEN_TYPE } from "@app/data";

export const getTokenFromRequest = (request: Request): string => {
  const authorizationHeader = request.headers["authorization"];

  if (!authorizationHeader) {
    throw new UnauthorizedException("Invalid authorization token!");
  }

  const [tokenType, authToken] = request.headers["authorization"]?.split(" ");

  if (tokenType !== TOKEN_TYPE) {
    throw new UnauthorizedException("Invalid token type!");
  }

  if (!authToken) {
    throw new UnauthorizedException("Invalid authorization token!");
  }
  return authToken;
};
