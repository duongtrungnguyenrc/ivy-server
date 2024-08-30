import { User } from "@app/schemas";
import { BaseResponse } from "./base-response";

export class SignUpResponse extends BaseResponse {
  data: boolean;
}
