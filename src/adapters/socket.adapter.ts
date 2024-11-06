import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
        origin: [this.configService.get<string>("CLIENT_URL")],
        methods: ["GET", "POST"],
        credentials: true,
      },
      ...options,
    };
    return super.createIOServer(port, ioOptions);
  }
}
