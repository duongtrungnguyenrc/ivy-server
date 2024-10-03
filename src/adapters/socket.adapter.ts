import { IoAdapter } from "@nestjs/platform-socket.io";

export class SocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const ioOptions: any = {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      ...options,
    };
    return super.createIOServer(port, ioOptions);
  }
}
