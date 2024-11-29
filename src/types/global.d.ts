declare type Roles = "ADMIN" | "CUSTOMER" | "OWNER";

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
