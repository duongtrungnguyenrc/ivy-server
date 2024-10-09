import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export const MessageQuery = createParamDecorator((key: string, ctx: ExecutionContext): string | undefined => {
  const client: Socket = ctx.switchToWs().getClient();

  if (!client?.handshake?.query) return undefined;

  const param = client.handshake.query[key];

  return typeof param === "string" ? param : undefined;
});
