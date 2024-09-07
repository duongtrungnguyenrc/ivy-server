import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class CreateCategoryPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isSpecial?: boolean;

  @IsArray()
  @IsOptional()
  collectionGroups?: Types.ObjectId[] = [];
}
