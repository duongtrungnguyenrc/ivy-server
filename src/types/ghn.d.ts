declare namespace Ghn {
  declare type GhnRequiredHeaders = {
    Token: string;
    ShopId: number;
    "Content-Type": string;
  };

  declare type GetFeePayload = {
    from_district_id: number;
    from_ward_code: string;
    service_id: number;
    to_district_id: number;
    to_ward_code: string;
    cod_value: number;
    insurance_value: number;
    weight: number;
  };
}
