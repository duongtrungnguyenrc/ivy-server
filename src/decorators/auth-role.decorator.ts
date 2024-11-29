import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { decode } from "jsonwebtoken";
import { Request } from "express";

import { getTokenFromRequest } from "@app/utils";
import { UserService } from "@app/services";
import { Role } from "@app/enums";

export const AuthRole = createParamDecorator(async (_, ctx: ExecutionContext): Promise<Role | null> => {
  const request: Request = ctx.switchToHttp().getRequest();

  const authToken: string = getTokenFromRequest(request, true);

  const decodedToken = decode(authToken);
  const decodedId = (decodedToken as JwtPayload)?.userId;

  if (!decodedId) return null;

  const userService: UserService = request["userService"] as UserService;
  const existingUser = await userService.find(decodedId, ["_id", "role"]);

  return existingUser?.role || null;
});
