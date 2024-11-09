import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions, ApiResponseProperty } from "@nestjs/swagger";
import { Prop, PropOptions } from "@nestjs/mongoose";

export const ApiSchemaProp = (
  schemaPropertyOptions?: PropOptions,
  apiPropertyOptions?: ApiPropertyOptions,
  apiResponsePropertyOption?: Pick<ApiPropertyOptions, "type" | "example" | "format" | "enum" | "deprecated">,
) => {
  return applyDecorators(
    ApiProperty(apiPropertyOptions),
    ApiResponseProperty(apiResponsePropertyOption),
    Prop(schemaPropertyOptions),
  );
};
