import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

export class SocketAdapter extends IoAdapter {
  private configService: ConfigService;

  constructor(app: INestApplication<any>) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const ioOptions: ServerOptions = {
      cors: {
        origin: [
          this.configService.get<string>("CLIENT_PROD_URL"),
          this.configService.get<string>("CLIENT_LOCAL_URL"),
          this.configService.get<string>("CLIENT_LOCAL_IP_URL"),
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      ...options,
    };
    return super.createIOServer(port, ioOptions);
  }
}
