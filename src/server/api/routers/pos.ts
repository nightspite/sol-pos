import {
  adminProcedure,
  cashierProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { posTable, storeTable } from "@/server/db/schema";
import { type SQL, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const posRouter = createTRPCRouter({
  createPos: adminProcedure.input(z.object({
    storeId: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.insert(posTable).values({
      storeId: input.storeId,
      name: input.name,
    }).returning();
  }),

  updatePos: adminProcedure.input(z.object({
    id: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(posTable).set({
      name: input.name,
    }).where(eq(posTable.id, input.id)).returning();
  }),

  deletePos: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(posTable).where(eq(posTable.id, input.id)).returning();
  }),

  getPos: cashierProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.posTable.findFirst({
      where: (u) => eq(u.id, input.id),
    });
  }),
});
