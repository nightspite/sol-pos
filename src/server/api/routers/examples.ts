import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  protected: protectedProcedure
    .query(({ input, ctx }) => {
      if (!ctx.session.user.name)
        throw new Error("User wallet not authenticated");

      if (ctx.session.user.name) {
        return "This is protected content. You can access this content because you are signed in with your Solana Wallet.";
      }

      return "You must be signed in with your Solana Wallet to view the protected content on this page.";
    }),
});
