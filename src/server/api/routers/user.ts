import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { hashPassword } from "@/lib/hash";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object(
      {
        name: z.string().min(1),
        username: z.string().min(4),
        password: z.string().min(8).max(50),
      }
    ))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (u) => eq(u.username, input.username),
      });

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        })
      }

      const [createdUser] = await ctx.db.insert(users).values({
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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
