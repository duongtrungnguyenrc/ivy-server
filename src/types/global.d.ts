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

declare type ResetPasswordTransactionPayload = {
  userId: string;
  otpCode: string;
};

declare type Pagination = {
  page: number;
  limit: number;
};
