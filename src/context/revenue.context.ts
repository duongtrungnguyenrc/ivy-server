import { RevenueCalculator } from "../interface";
import { Order } from "@app/schemas";

export class RevenueContext {
  private calculator: RevenueCalculator;

  constructor(calculator: RevenueCalculator) {
    this.calculator = calculator;
  }

  setCalculator(calculator: RevenueCalculator) {
    this.calculator = calculator;
  }

  calculate(orders: Order[]): number {
    return this.calculator.calculateRevenue(orders);
  }
}
