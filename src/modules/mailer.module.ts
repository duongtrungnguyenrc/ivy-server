import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { join } from "path";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>("MAILER_HOST"),
            port: configService.get<number>("MAILER_PORT"),
            secure: false,
            auth: {
              user: configService.get<string>("MAILER_USER"),
              pass: configService.get<string>("MAILER_PASSWORD"),
            },
          },
          defaults: {
            from: '"No Reply" <VLearning@gmail.com>',
          },
          template: {
            dir: join(__dirname, "../resources/templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MailModule],
})
export class MailModule {}
