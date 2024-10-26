import { CalcDeliveryFeePayload } from "@app/models";
import { Order } from "@app/schemas";

export interface IDeliveryService {
  calcFee(payload: CalcDeliveryFeePayload): Promise<number>;
  createOrder(payload: Order): Promise<any>;
  handleCallback(data: any): void;
}
