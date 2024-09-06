import { UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

import { TOKEN_TYPE } from "@app/constants";

export const getTokenFromRequest = (request: Request, raw: boolean = false): string => {
  const authorizationHeader = request.headers["authorization"];

  if (!authorizationHeader && !raw) {
    throw new UnauthorizedException("Authorization header missing!");
  }

  const [tokenType, authToken] = authorizationHeader?.split(" ") ?? [];

  if (!tokenType && !raw) {
    throw new UnauthorizedException("Token type is missing!");
  }

  if (tokenType !== TOKEN_TYPE && !raw) {
    throw new UnauthorizedException("Invalid token type!");
  }

  if (!authToken && !raw) {
    throw new UnauthorizedException("Authorization token is missing!");
  }

  return authToken;
};
