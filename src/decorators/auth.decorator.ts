import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { IAuthGuard, Type } from "@nestjs/passport";

import { JWTAccessAuthGuard } from "@app/guards";
import { AuthMessages, Role } from "@app/enums";

export type ValidRole = `${Role}` | "*";

export const Auth = (roles: ValidRole[] = ["*"], guard: Type<IAuthGuard> = JWTAccessAuthGuard) => {
  const tokenDescription: string = roles.includes("ADMIN")
    ? AuthMessages.AUTH_ADMIN_TOKEN
    : roles.includes("CUSTOMER")
      ? AuthMessages.AUTH_CUSTOMER_TOKEN
      : AuthMessages.AUTH_TOKEN;

  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(guard),
    ApiBearerAuth("Authorization"),
    ApiHeader({ name: "authorization", required: true, description: tokenDescription }),
  );
};
