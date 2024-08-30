import { BaseResponse } from "./base-response";

export class SignInResponse extends BaseResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
