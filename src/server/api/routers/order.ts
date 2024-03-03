import {
  adminProcedure,
  cashierProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { orderTable, storeTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type SQL, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
  createOrder: cashierProcedure.input(z.object({
    storeId: z.string(),
    posId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const [createdOrder] = await ctx.db.insert(orderTable).values({
      posId: input.posId,
      storeId: input.storeId,
      status: "CART",
    }).returning();

    if (!createdOrder) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    return createdOrder;
  }),

  // addProductToOrder: cashierProcedure.input(z.object({
  //   orderId: z.string(),
  //   productId: z.string(),
  //   quantity: z.number(),
  // })).mutation(async ({ ctx, input }) => {
  //   const [order] = await ctx.db.query.orderTable.findFirst({
  //     where: (u) => eq(u.id, input.orderId),
  //   });

  //   if (!order) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Order not found",
  //     });
  //   }

  //   const [product] = await ctx.db.query.productToStoreTable.findFirst({
  //     where: (u) => eq(u.productId, input.productId),
  //   });

  //   if (!product) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Product not found",
  //     });
  //   }

  //   const [orderItem] = await ctx.db.insert(orderTable.items).values({
  //     orderId: input.orderId,
  //     productId: input.productId,
  //     quantity: input.quantity,
  //   }).returning();

  //   if (!orderItem) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Order item not found",
  //     });
  //   }

  //   return orderItem;
  // }),

  getAllOrder: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.orderTable.findMany();
  }),

  getOrderList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.orderTable.findMany({
        limit: input.limit,
        offset: input.offset,
        with: {
          items: true,
          pos: true,
          store: true,
        }
      });
      const [total] = await trx
        .select({ total: sql<string>`count(*)` })
        .from(orderTable);
      return {
        items: items || [],
        total: total?.total ? parseInt(total.total, 10) : 0,
      };
    });
  }),

  getOrder: cashierProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.orderTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: true,
      },
    });
  }),
});
