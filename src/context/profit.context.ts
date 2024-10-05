import { ProfitCalculator } from "../interface";
import { Order } from "@app/schemas";

export class ProfitContext {
  private calculator: ProfitCalculator;

  constructor(calculator: ProfitCalculator) {
    this.calculator = calculator;
  }

  setCalculator(calculator: ProfitCalculator) {
    this.calculator = calculator;
  }

  calculate(orders: Order[]): number {
    return this.calculator.calculateProfit(orders);
  }
}
