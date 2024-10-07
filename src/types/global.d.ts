declare type Roles = "ADMIN" | "USER";

declare type JwtPayload = {
  userId: string;
  role: Roles;
  iat?: number;
  exp?: number;
};

declare type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

declare type ResetPasswordTransaction = {
  userId: string;
  transactionId: string;
  otpCode: string;
  ipAddress: string;
};

declare type Pagination = {
  page: number;
  limit: number;
};

declare type PaginationResponse<T> = {
  meta: {
    pages: number;
    page: number;
    limit: number;
  };

  data: Array<T>;
};

declare type InfiniteResponse<T> = {
  nextCursor?: number;
  data: Array<T>;
};
