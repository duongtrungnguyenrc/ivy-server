declare type Roles = "ADMIN" | "USER";

declare type JwtPayload = {
  userId: string;
  role: Roles;
};

declare type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

declare type BaseResponse = {
  data: any;
  message: string;
};

declare type ResetPasswordTransactionPayload = {
  userId: string;
  otpCode: string;
};

declare type Pagination = {
  page: number;
  limit: number;
};
