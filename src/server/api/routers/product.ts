import { createProductSchema, updateProductSchema } from "@/schemas/product";
import {
  adminProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { productTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  createProduct: adminProcedure.input(createProductSchema).mutation(async ({ ctx, input }) => {
    const [createdProduct] = await ctx.db.insert(productTable).values({
      name: input.name,
      price: input.price,
    }).returning();

    if (!createdProduct) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product",
      });
    }

    return createdProduct;
  }),

  updateProduct: adminProcedure.input(updateProductSchema).mutation(async ({ ctx, input }) => {
    const [updateProduct] = await ctx.db.update(productTable).set({
      name: input.name,
      price: input.price,
    }).where(eq(productTable.id, input.id)).returning();

    if (!updateProduct) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product",
      });
    }

    return updateProduct;
  }),

  deleteProduct: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const [deletedProduct] = await ctx.db.delete(productTable).where(eq(productTable.id, input.id)).returning();

    if (!deletedProduct) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete product",
      });
    }

    return deletedProduct;
  }),

  getProduct: adminProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.productTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        stores: {
          with: {
            store: true,
          },
        },
        orderItem: {
          with: {
            order: {
              with: {
                store: true,
              }
            },
          },
        }
      }
    });
  }),

  getAllProducts: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.productTable.findMany();
  }),

  getProductList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.productTable.findMany({
        limit: input.limit,
        offset: input.offset,
        with: {
          stores: true,
        }
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
});
