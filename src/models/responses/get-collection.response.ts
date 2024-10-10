import { Collection } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class GetCollectionResponse {
  @ApiResponseProperty()
  collection: Collection;

  filterOptions: CollectionFilter;
}

export class CollectionFilter {
  @ApiResponseProperty()
  colors: string[];

  @ApiResponseProperty()
  sizes: string[];

  @ApiResponseProperty()
  materials: string[];
}
