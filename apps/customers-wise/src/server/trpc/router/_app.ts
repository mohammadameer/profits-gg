import { router } from "../trpc";
import { authRouter } from "./auth";
import { linksRouter } from "./links";
import { locationsRouter } from "./locations";
import { organizationsRouter } from "./organizations";
import { reviewsRouter } from "./reviews";
import { statisticsRouter } from "./statistics";
import { stripeRouter } from "./stripe";
import { usersRouter } from "./users";

export const appRouter = router({
  statistics: statisticsRouter,
  users: usersRouter,
  organizations: organizationsRouter,
  locations: locationsRouter,
  links: linksRouter,
  reviews: reviewsRouter,
  stripe: stripeRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
