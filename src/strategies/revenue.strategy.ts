import { RevenueCalculator } from "../interface";
import { Order } from "@app/schemas";

export class PercentageRevenueCalculator implements RevenueCalculator {
  calculateRevenue(orders: Order[]): number {
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        console.log("hello", item);
        // Giả sử `item.cost` có cấu trúc như sau:
        // { saleCost: number; discountPercentage: number; }
        const cost = item.cost;
        console.log("toi la Cost", cost);
        const saleCost = item.cost.saleCost; // Lấy giá bán
        const discountPercentage = item.cost.discountPercentage; // Lấy phần trăm giảm giá
        console.log("toi la saleCost", saleCost);
        const quantity = item.quantity; // Số lượng của sản phẩm

        // Tính doanh thu cho từng sản phẩm
        const revenue = saleCost * (1 - discountPercentage / 100) * quantity;
        totalRevenue += revenue; // Cộng dồn vào tổng doanh thu
      });
    });

    return totalRevenue;
  }
}
