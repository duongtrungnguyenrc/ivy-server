declare namespace Ghn {
  declare type Response<T> = {
    code: number;
    message: string;
    code_message_value: number;
    data: T;
  };

  type Item = {
    name: string;
    quantity: number;
    height: number;
    weight: number;
    length: number;
    width: number;
  };

  declare type Service = {
    service_id: number;
    short_name: string;
    service_type_id: number;
    config_fee_id: string;
    extra_cost_id: string;
    standard_config_fee_id: string;
    standard_extra_cost_id: string;
    ecom_config_fee_id: number;
    ecom_extra_cost_id: number;
    ecom_standard_config_fee_id: number;
    ecom_standard_extra_cost_id: number;
  };

  declare type ShippingFee = {
    total: number;
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    coupon_value: number;
    r2s_fee: number;
    return_again: number;
    document_return: number;
    double_check: number;
    cod_fee: number;
    pick_remote_areas_fee: number;
    deliver_remote_areas_fee: number;
    cod_failed_fee: number;
  };

  declare type GetAvailableServicesPayload = {
    shop_id: number;
    from_district: number;
    to_district: number;
  };

  type CalcShippingFeePayload = {
    from_district_id: number;
    from_ward_code: string;
    service_id: number;
    service_type_id: number | null;
    to_district_id: number;
    to_ward_code: string;
    height: number;
    length: number;
    weight: number;
    width: number;
    insurance_value: number;
    cod_failed_amount: number;
    coupon?: string;
    items: Array<Item>;
  };
}
