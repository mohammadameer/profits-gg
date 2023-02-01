import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const statisticsRouter = router({
  totalReviews: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.review.count({
      where: {
        organizationId: ctx.session.user.organization?.id,
      },
    })
  ),
  medianRating: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.review.aggregate({
      where: {
        organizationId: ctx.session.user.organization?.id,
      },
      _avg: {
        rating: true,
      },
    })
  ),
  locationsAverageRating: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.review.aggregate({
      where: {
        organizationId: ctx.session.user.organization?.id,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    })
  ),
});
