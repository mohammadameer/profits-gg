import { openaiRouter } from "~/server/api/routers/openai";
import { stripeRouter } from "~/server/api/routers/stripe";
import { storyRouter } from "~/server/api/routers/story";
import { userRouter } from "~/server/api/routers/user";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  openai: openaiRouter,
  stripe: stripeRouter,
  story: storyRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
