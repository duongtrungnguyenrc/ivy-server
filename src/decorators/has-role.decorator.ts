import { SetMetadata } from "@nestjs/common";

import { Role } from "@app/enums";

export type RoleType = `${Role}` | "*";

export const HasRole = (...roles: RoleType[]) => SetMetadata("roles", roles);
