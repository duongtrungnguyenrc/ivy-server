import { applyDecorators } from "@nestjs/common";
import { PaginationMessaqes } from "@app/enums";
import { ApiQuery } from "@nestjs/swagger";

export const ApiPagination = () => {
  return applyDecorators(
    ApiQuery({ type: Number, name: "page", description: PaginationMessaqes.PAGE, required: true }),
    ApiQuery({ type: Number, name: "limit", description: PaginationMessaqes.LIMIT, required: false }),
  );
};
