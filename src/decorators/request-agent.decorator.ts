import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as UAParser from "ua-parser-js";

export const RequestAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): [string, string] => {
  const request = ctx.switchToHttp().getRequest();
  const userAgent = request.headers["user-agent"];

  const parser = new UAParser(userAgent);
  const { browser, device, os } = parser.getResult();

  const deviceInfo = `${device.vendor} ${device.model}`;
  const browserInfo = `${browser.name} ${os.name}`;
  return [deviceInfo, browserInfo];
});
