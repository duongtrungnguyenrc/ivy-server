import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Cache } from "@nestjs/cache-manager";

import { REVOKE_ACCESS_TOKEN_CACHE_PREFIX } from "@app/data";
import { joinCacheKey } from "@app/utils";

@Injectable()
export class JwtAccessService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheManager: Cache,
  ) {}

  decodeToken<T>(token: string): T {
    return this.jwtService.decode(token);
  }

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async revokeToken(token: string): Promise<void> {
    const decodeRequestken = await this.jwtService.decode(token);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodeRequestken["exp"] - currentTime) * 1000;

    this.cacheManager.set(joinCacheKey(REVOKE_ACCESS_TOKEN_CACHE_PREFIX, token), token, tokenValidTime);
  }

  async verifyToken(token: string): Promise<boolean> {
    const revokeToken = await this.cacheManager.get(joinCacheKey(REVOKE_ACCESS_TOKEN_CACHE_PREFIX, token));

    if (revokeToken) return;

    const verifyResult = this.jwtService.verify(token);

    return verifyResult;
  }
}
