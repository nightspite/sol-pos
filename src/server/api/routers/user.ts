import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { userTable } from "@/server/db/schema";
import { hashPassword } from "@/lib/hash";
import { TRPCError } from "@trpc/server";
import { type SQL, and, desc, eq, sql } from "drizzle-orm";
import { createUserSchema, updateMeSchema, updateUserSchema } from "@/schemas/user";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.userTable.findFirst({
      where: (u) => eq(u.id, ctx.session.user.id),
      with: {
        stores: {
          with: {
            store: {
              with: {
                pos: true,
              }
            }
          }
        }
      },
    });
  }),

  signup: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.userTable.findFirst({
        where: (u) => eq(u.username, input.username),
      });

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        })
      }

      const [createdUser] = await ctx.db.insert(userTable).values({
        username: input.username,
        password: hashPassword(input.password),
        name: input.name,
      }).returning();

      if (!createdUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const { password, ...rest } = createdUser;
      return { ...rest };
    }),

  updateMe: protectedProcedure.input(updateMeSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.update(userTable).set({
      name: input.name,
    }).where(eq(userTable.id, ctx.session.user.id)).returning();
  }),

  updatePassword: protectedProcedure.input(z.object({
    password: z.string(),
  })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(userTable).set({
      password: hashPassword(input.password),
    }).where(eq(userTable.id, ctx.session.user.id));
  }),

  // *****
  // ADMIN
  // *****
  createUser: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.userTable.findFirst({
        where: (u) => eq(u.username, input.username),
      });

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        })
      }

      const [createdUser] = await ctx.db.insert(userTable).values({
        username: input.username,
        password: hashPassword(input.password),
        name: input.name,
      }).returning();

      if (!createdUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const { password, ...rest } = createdUser;
      return { ...rest };
    }),

  getUserList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx }) => {
    // const where: SQL<unknown> | undefined = and();
    const where: SQL<unknown> | undefined = undefined;
    
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.userTable.findMany({
        where,
        with: {
          stores: true,
        },
        orderBy: desc(userTable.createdAt),
        limit: 10,
        offset: 0,
      });
      const [total] = await  trx
        .select({ total: sql<string>`count(*)` })
        .from(userTable)
        .where(where);

      return  {
        items: items || [],
        total: total?.total ? parseInt(total.total, 10) : 0,
      }
    });
  }),

  getUser: adminProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.userTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        stores: {
          with: {
            store: true,
          }
        }
      },
    });
  }),

  updateUser: adminProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
    const [updatedUser] = await ctx.db.update(userTable).set({
      username: input.username,
      name: input.name,
    }).where(eq(userTable.id, input.id)).returning();

    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }

    return updatedUser;
  }),

  deleteUser: adminProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.delete(userTable).where(eq(userTable.id, input.id)).returning();
  }),
});
