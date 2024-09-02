import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Group, GroupSchema } from "@app/schemas";
import { GroupController } from "@app/controllers";
import { GroupService } from "@app/services";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
