import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const reviewsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        location: z.string().nullish(),
        rating: z.number().nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? 10;
      const skip = input.cursor ?? 0;

      const reviews = await ctx.prisma.review.findMany({
        include: {
          location: true,
          link: true,
        },
        where: {
          organizationId: ctx.session.user.organization?.id,
          locationId: input.location || undefined,
          rating: {
            equals: input.rating as number,
          },
        },
        take: take + 1, // get an extra item at the end which we'll use as next cursor
        skip,
      });

      const reviewsFetched = reviews.length;
      let nextCursor: typeof skip | null = skip;
      if (reviewsFetched > take) {
        nextCursor += reviewsFetched;
      } else {
        nextCursor = null;
      }

      return {
        reviews,
        nextCursor,
      };
    }),
  retrieve: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
      })
    ),
  create: publicProcedure
    .input(
      z.object({
        comment: z.string(),
        rating: z.number(),
        organizationId: z.string(),
        locationId: z.string(),
        linkId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.review.create({
        data: {
          comment: input.comment,
          rating: input.rating,
          organizationId: input.organizationId,
          locationId: input.locationId,
          linkId: input.linkId,
        },
      })
    ),
});
