import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { storeRouter } from "./routers/store";
import { posRouter } from "./routers/pos";
import { productRouter } from "./routers/product";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  store: storeRouter,
  pos: posRouter,
  product: productRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
