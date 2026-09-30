import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  rowToOrder,
  rowToStoreProduct,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
} from "@/lib/db/mappers";
import { localListOrders, localListProducts } from "@/lib/db/local-store";
import { getCustomers } from "@/lib/customers/getCustomers";
import type { OrderRecord } from "@/lib/db/types";
import type { OrderStatus } from "@/lib/db/statuses";
import { ORDER_STATUSES } from "@/lib/db/statuses";
import type {
  BestSeller,
  PaymentSplit,
  RevenuePoint,
} from "@/lib/db/client-types";
import type { StoreProduct } from "@/lib/products/types";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/pricing";
import { PRODUCT_COLUMNS } from "@/lib/products/getProducts";

/* ------------------------------------------------------------------
   Dashboard + analytics aggregation.
   Every figure is derived from the orders table, so the numbers in the
   admin panel can never drift from what the storefront recorded.
   ------------------------------------------------------------------ */

export type { BestSeller, PaymentSplit, RevenuePoint };

export type AnalyticsData = {
  totalRevenue: number;
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  statusDistribution: Array<{ status: OrderStatus; count: number; revenue: number }>;
  revenueByDay: RevenuePoint[];
  bestSellers: BestSeller[];
  paymentSplit: PaymentSplit[];
  recentOrders: OrderRecord[];
  lowStock: StoreProduct[];
  dataSource: "supabase" | "local";
};

const NON_REVENUE_STATUSES: OrderStatus[] = ["cancelled", "returned"];

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isRevenueOrder(order: OrderRecord): boolean {
  return !NON_REVENUE_STATUSES.includes(order.orderStatus);
}

export function computeAnalytics(
  orders: OrderRecord[],
  products: StoreProduct[],
  customerCount: number,
  dataSource: "supabase" | "local",
): AnalyticsData {
  const revenueOrders = orders.filter(isRevenueOrder);

  const now = new Date();
  const todayKey = dayKey(now);
  const sevenDaysAgo = new Date(now.getTime() - 6 * 86_400_000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 86_400_000).toISOString();

  const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const revenueToday = revenueOrders
    .filter((order) => dayKey(new Date(order.createdAt)) === todayKey)
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const revenue7d = revenueOrders
    .filter((order) => order.createdAt >= sevenDaysAgo)
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const revenue30d = revenueOrders
    .filter((order) => order.createdAt >= thirtyDaysAgo)
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const countByStatus = (status: OrderStatus) =>
    orders.filter((order) => order.orderStatus === status).length;

  /* --- 30-day revenue trend --- */
  const trend = new Map<string, RevenuePoint>();
  for (let offset = 29; offset >= 0; offset -= 1) {
    const key = dayKey(new Date(now.getTime() - offset * 86_400_000));
    trend.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const order of revenueOrders) {
    const point = trend.get(dayKey(new Date(order.createdAt)));
    if (point) {
      point.revenue = Math.round((point.revenue + order.totalAmount) * 100) / 100;
      point.orders += 1;
    }
  }

  /* --- best sellers --- */
  const sellerMap = new Map<string, BestSeller>();
  for (const order of revenueOrders) {
    for (const item of order.items) {
      const key = item.productId ?? item.productName;
      const entry =
        sellerMap.get(key) ??
        ({
          productId: item.productId,
          name: item.productName,
          quantity: 0,
          revenue: 0,
        } satisfies BestSeller);
      entry.quantity += item.quantity;
      entry.revenue = Math.round((entry.revenue + item.subtotal) * 100) / 100;
      sellerMap.set(key, entry);
    }
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenueToday: Math.round(revenueToday * 100) / 100,
    revenue7d: Math.round(revenue7d * 100) / 100,
    revenue30d: Math.round(revenue30d * 100) / 100,
    totalOrders: orders.length,
    pendingOrders: countByStatus("pending"),
    confirmedOrders: countByStatus("confirmed"),
    processingOrders: countByStatus("processing"),
    shippedOrders: countByStatus("shipped"),
    deliveredOrders: countByStatus("delivered"),
    cancelledOrders: countByStatus("cancelled"),
    returnedOrders: countByStatus("returned"),
    averageOrderValue: revenueOrders.length
      ? Math.round((totalRevenue / revenueOrders.length) * 100) / 100
      : 0,
    totalCustomers: customerCount,
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.status === "active").length,
    statusDistribution: ORDER_STATUSES.map((status) => {
      const matching = orders.filter((order) => order.orderStatus === status);
      return {
        status,
        count: matching.length,
        revenue:
          Math.round(
            matching.reduce((sum, order) => sum + order.totalAmount, 0) * 100,
          ) / 100,
      };
    }),
    revenueByDay: [...trend.values()],
    bestSellers: [...sellerMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
    paymentSplit: PAYMENT_METHODS.map((method: PaymentMethod) => {
      const matching = revenueOrders.filter(
        (order) => order.paymentMethod === method,
      );
      return {
        method,
        count: matching.length,
        revenue:
          Math.round(
            matching.reduce((sum, order) => sum + order.totalAmount, 0) * 100,
          ) / 100,
      };
    }),
    recentOrders: orders.slice(0, 6),
    lowStock: products
      .filter((product) => product.stockQuantity <= 5)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5),
    dataSource,
  };
}

export async function getAnalytics(days = 120): Promise<AnalyticsData> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const { orders } = localListOrders({ limit: 5000, orderBy: "newest" });
    const products = localListProducts({ includeInactive: true });
    const customers = await getCustomers();
    return computeAnalytics(orders, products, customers.length, "local");
  }

  try {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const [ordersResult, productsResult, customers] = await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase.from("products").select(PRODUCT_COLUMNS).limit(500),
      getCustomers(),
    ]);

    const rows = (ordersResult.data ?? []) as unknown as Array<
      OrderRow & { order_items?: OrderItemRow[] | null }
    >;
    const orders = rows.map((row) => rowToOrder(row, row.order_items ?? []));
    const products = ((productsResult.data ?? []) as unknown as ProductRow[]).map(
      rowToStoreProduct,
    );

    return computeAnalytics(orders, products, customers.length, "supabase");
  } catch (error) {
    console.error("[analytics] Supabase query failed — using local store:", error);
    const { orders } = localListOrders({ limit: 5000, orderBy: "newest" });
    const products = localListProducts({ includeInactive: true });
    const customers = await getCustomers();
    return computeAnalytics(orders, products, customers.length, "local");
  }
}

