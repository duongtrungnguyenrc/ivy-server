import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { IAuthGuard, Type } from "@nestjs/passport";

import { JWTAccessAuthGuard } from "@app/guards";
import { AuthMessages, Role } from "@app/enums";

export type RoleType = `${Role}` | "*";

export const Auth = (roles: RoleType[] = ["*"], guard: Type<IAuthGuard> = JWTAccessAuthGuard) => {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(guard),
    ApiBearerAuth("Authorization"),
    ApiHeader({ name: "authorization", required: true, description: AuthMessages.AUTH_TOKEN }),
  );
};
