import {
  adminProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { posTable, storeTable } from "@/server/db/schema";
import { type SQL, eq, sql, desc } from "drizzle-orm";
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
          }
        },
        users: {
          with: {
            user: true,
          }
        },
      },
    });
  }),

  createStore: adminProcedure.input(z.object({
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(storeTable).values({
      name: input.name,
    }).returning();
  }),

  updateStore: adminProcedure.input(z.object({
    id: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(storeTable).set({
      name: input.name,
    }).where(eq(storeTable.id, input.id)).returning();
  }),

  deleteStore: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(storeTable).where(eq(storeTable.id, input.id)).returning();
  }),

  createPos: adminProcedure.input(z.object({
    storeId: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(posTable).values({
      storeId: input.storeId,
      name: input.name,
    }).returning();
  }),
});
