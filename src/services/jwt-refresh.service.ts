import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { REVOKE_REFRESH_TOKEN_CACHE_PREFIX } from "@app/constants";
import { CacheService } from "./cache.service";
import { joinCacheKey } from "@app/utils";

@Injectable()
export class JwtRefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  decodeToken(token: string): JwtPayload {
    return this.jwtService.decode(token);
  }

  generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  async revokeToken(token: string): Promise<void> {
    const decodedToken: JwtPayload = await this.jwtService.decode(token);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedToken["exp"] - currentTime) * 1000;

    this.cacheService.set(joinCacheKey(REVOKE_REFRESH_TOKEN_CACHE_PREFIX, token), token, tokenValidTime);
  }

  async verifyToken(token: string): Promise<any> {
    const revokeToken = await this.cacheService.get(joinCacheKey(REVOKE_REFRESH_TOKEN_CACHE_PREFIX, token));

    if (revokeToken) return;

    const verifyResult = this.jwtService.verify(token);

    return verifyResult;
  }
}
