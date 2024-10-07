import { ApiProperty } from "@nestjs/swagger";

export class SendEmailPayload {
  @ApiProperty()
  email: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  content: string;
}
