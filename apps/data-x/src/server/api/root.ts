import { createTRPCRouter } from "./trpc";
import { stripeRouter } from "./routers/stripe";
import { dataRouter } from "./routers/data";
import { userRouter } from "./routers/user";
import { listRouter } from "./routers/list";
import { stageRouter } from "./routers/stage";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  stripe: stripeRouter,
  user: userRouter,
  list: listRouter,
  stage: stageRouter,
  data: dataRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
