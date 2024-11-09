import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { decode } from "jsonwebtoken";
import { Request } from "express";

import { getTokenFromRequest } from "@app/utils";
import { UserService } from "@app/services";

export const AuthUid = createParamDecorator(async (_, ctx: ExecutionContext): Promise<string | null> => {
  const request: Request = ctx.switchToHttp().getRequest();

  const authToken: string = getTokenFromRequest(request, true);

  const decodedToken = decode(authToken);
  const decodedId = (decodedToken as JwtPayload)?.userId;

  if (!decodedId) return null;

  const userService: UserService = request["userService"] as UserService;
  const existingUser = await userService.find(decodedId, ["_id"], [], false, `id`);

  return existingUser?._id || null;
});
