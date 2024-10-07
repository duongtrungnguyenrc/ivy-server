import { Role } from "@app/enums";
import { JWTAccessAuthGuard } from "@app/guards";
import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { IAuthGuard, Type } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";

export type RoleType = `${Role}` | "*";

export const Auth = (roles: RoleType[] = ["*"], guard: Type<IAuthGuard> = JWTAccessAuthGuard) => {
  return applyDecorators(SetMetadata("roles", roles), UseGuards(guard), ApiBearerAuth());
};
