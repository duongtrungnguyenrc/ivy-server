import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as compression from "compression";
import { NestFactory } from "@nestjs/core";

import { SocketAdapter } from "@app/adapters";
import { AppModule } from "@app/modules";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  app.use(compression());
  app.setGlobalPrefix("/api");
  app.enableCors({
    origin: [configService.get<string>("CLIENT_URL")],
    methods: "GET,PUT,POST,DELETE",
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketAdapter(app));

  const config = new DocumentBuilder()
    .setTitle("Ivy server")
    .setDescription("Ivy fashion store web server using Nest JS")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "Bearer",
        bearerFormat: "JWT",
      },
      "authorization",
    )
    .addServer("/")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/", app, document, {
    jsonDocumentUrl: "swagger/json",
  });

  await app.listen(3000);
}
bootstrap();
