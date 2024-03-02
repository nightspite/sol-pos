import {
  adminProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { posTable, productTable, productToStoreTable, storeTable } from "@/server/db/schema";
import { type SQL, eq, sql, and } from "drizzle-orm";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  createProduct: adminProcedure.input(z.object({
    name: z.string(),
    price: z.number(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(productTable).values({
      name: input.name,
      price: input.price,
    }).returning();
  }),

  updateProduct: adminProcedure.input(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(productTable).set({
      name: input.name,
      price: input.price,
    }).where(eq(productTable.id, input.id)).returning();
  }),

  deleteProduct: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(productTable).where(eq(productTable.id, input.id)).returning();
  }),

  getProduct: adminProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.productTable.findFirst({
      where: (u) => eq(u.id, input.id),
    });
  }),

  getProductList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.productTable.findMany({
        limit: input.limit,
        offset: input.offset,
      });
      const [total] = await trx
        .select({ total: sql<string>`count(*)` })
        .from(productTable);
      return {
        items: items || [],
        total: total?.total ? parseInt(total.total, 10) : 0,
      };
    });
  }),

  assignProductToStore: adminProcedure.input(z.object({
    productId: z.string(),
    storeId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(productToStoreTable).values({
      productId: input.productId,
      storeId: input.storeId,
    }).returning();
  }),

  removeProductFromStore: adminProcedure.input(z.object({
    productId: z.string(),
    storeId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(productToStoreTable)
      .where(and(eq(productToStoreTable.productId, input.productId), eq(productToStoreTable.storeId, input.storeId))).returning();
  }),
});
