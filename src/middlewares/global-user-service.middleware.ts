import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

import { UserService } from "@app/services";

@Injectable()
export class GlobalUserServiceMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  use(req: Request, _: Response, next: NextFunction) {
    req["userService"] = this.userService;
    next();
  }
}
