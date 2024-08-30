import { Module } from "@nestjs/common";

import { TestController } from "@app/controllers";

@Module({
  imports: [],
  controllers: [TestController],
  providers: [],
})
export class AppModule {}
