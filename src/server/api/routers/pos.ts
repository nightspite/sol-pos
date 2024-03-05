import {
  adminProcedure,
  cashierProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { posTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const posRouter = createTRPCRouter({
  createPos: adminProcedure.input(z.object({
    storeId: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const [createdPos] = await ctx.db.insert(posTable).values({
      storeId: input.storeId,
      name: input.name,
    }).returning();

    if (!createdPos) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pos not found",
      });
    }

    return createdPos;
  }),

  getPos: cashierProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.posTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        store: {
          with: {
            products: true,
            users: true,
          }
        }
      }
    });
  }),
});
