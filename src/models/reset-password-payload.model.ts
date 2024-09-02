import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordPayload{
  @ApiProperty()
  otpCode: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  newPassword: string;
}
