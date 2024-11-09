import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { REVOKE_ACCESS_TOKEN_CACHE_PREFIX } from "@app/constants";
import { CacheService } from "./cache.service";
import { joinCacheKey } from "@app/utils";

@Injectable()
export class JwtAccessService {
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
    const decodedToken = await this.jwtService.decode(token);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedToken["exp"] - currentTime) * 1000;

    await this.cacheService.set(joinCacheKey(REVOKE_ACCESS_TOKEN_CACHE_PREFIX, token), token, tokenValidTime);
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      if (await this.isRevoked(token)) return false;

      return !!this.jwtService.verify(token);
    } catch (error) {
      return false;
    }
  }

  async isRevoked(token: string): Promise<boolean> {
    const revokedToken = await this.cacheService.get(joinCacheKey(REVOKE_ACCESS_TOKEN_CACHE_PREFIX, token));

    return !!revokedToken;
  }
}
