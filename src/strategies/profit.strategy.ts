import { ProfitCalculator } from "../interface";
import { Order } from "@app/schemas";

export class PercentageProfitCalculator implements ProfitCalculator {
  calculateProfit(orders: Order[]): number {
    let totalProfit = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const { saleCost, discountPercentage, ingredientCost, productionCost } = item.cost;
        const { quantity } = item;

        const profit = (saleCost * (1 - discountPercentage / 100) - (ingredientCost + productionCost)) * quantity;
        totalProfit += profit;
      });
    });

    return totalProfit;
  }
}
