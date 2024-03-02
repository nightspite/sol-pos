import { assignPosToStoreSchema, assignProductToStoreSchema, assignUserToStoreSchema, changeProductToStoreQuantitySchema, createStoreSchema, unassignPosToStoreSchema, unassignProductToStoreSchema, unassignUserToStoreSchema, updateStoreSchema } from "@/schemas/store";
import {
  adminProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { posTable, productToStoreTable, storeTable, userToStoreTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type SQL, eq, sql, desc, and } from "drizzle-orm";
import { z } from "zod";

export const storeRouter = createTRPCRouter({
  getStoreList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx }) => {
    // const where: SQL<unknown> | undefined = and();
    const where: SQL<unknown> | undefined = undefined;
    
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.storeTable.findMany({
        where,
        with: {
          pos: true,
          users: {
            with: {
              user: true,
            }
          },
          products: {
            with: {
              product: true,
            }
          }
        },
        orderBy: desc(storeTable.createdAt),
        limit: 10,
        offset: 0,
      });
      const [total] = await  trx
        .select({ total: sql<string>`count(*)` })
        .from(storeTable)
        .where(where);

      return  {
        items: items || [],
        total: total?.total ? parseInt(total.total, 10) : 0,
      }
    });
  }),

  getStore: adminProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.storeTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        pos: true,
        products: {
          with: {
            product: true,
          },
        },
        users: {
          with: {
            user: true,
          }
        },
      },
    });
  }),

  createStore: adminProcedure.input(createStoreSchema).mutation(async ({ ctx, input }) => {
    const [createdStore] = await ctx.db.insert(storeTable).values({
      name: input.name,
    }).returning();

    if (!createdStore) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create store",
      });
    }

    return createdStore;
  }),

  updateStore: adminProcedure.input(updateStoreSchema).mutation(async ({ ctx, input }) => {
    const [updatedStore] = await ctx.db.update(storeTable).set({
      name: input.name,
    }).where(eq(storeTable.id, input.id)).returning();

    if (!updatedStore) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update store",
      });
    }

    return updatedStore;
  }),

  deleteStore: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const [deletedStore] = await ctx.db.delete(storeTable).where(eq(storeTable.id, input.id)).returning();

    if (!deletedStore) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete store",
      });
    }

    return deletedStore;
  }),

  assignUserToStore: adminProcedure.input(assignUserToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(userToStoreTable).values({
      storeId: input.storeId,
      userId: input.userId,
    }).returning();
  }),

  unassignUserToStore: adminProcedure.input(unassignUserToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(userToStoreTable).where(and(
      eq(userToStoreTable.storeId, input.storeId),
      eq(userToStoreTable.userId, input.userId),
    )).returning();
  }),

  assignProductToStore: adminProcedure.input(assignProductToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(productToStoreTable).values({
      storeId: input.storeId,
      productId: input.productId,
      quantity: input.quantity,
    }).returning();
  }),

  unassignProductToStore: adminProcedure.input(unassignProductToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(productToStoreTable).where(and(
      eq(productToStoreTable.storeId, input.storeId),
      eq(productToStoreTable.productId, input.productId),
    )).returning();
  }),

  changeProductToStoreQuantity: adminProcedure.input(changeProductToStoreQuantitySchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(productToStoreTable).set({
      quantity: input.quantity,
    }).where(and(
      eq(productToStoreTable.storeId, input.storeId),
      eq(productToStoreTable.productId, input.productId),
    )).returning();
  }),

  assignPosToStore: adminProcedure.input(assignPosToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(posTable).set({
      storeId: input.storeId,
    }).where(eq(posTable.id, input.posId)).returning();
  }),

  unassignPosToStore: adminProcedure.input(unassignPosToStoreSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(posTable).set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(posTable.id, input.posId)).returning();
  }),
});
