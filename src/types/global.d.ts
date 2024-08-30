declare type JwtPayload = {
  userId: string;
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
