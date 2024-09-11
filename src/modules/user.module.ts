import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { UserService } from "@app/services";
import { User, UserSchema } from "@app/schemas";
import { UserController } from "@app/controllers";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
