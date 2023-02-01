import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const locationsRouter = router({
  total: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.location.count({
      where: { organizationId: ctx.session.user.organization?.id },
    })
  ),
  list: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.location.findMany({
      where: { organizationId: ctx.session.user.organization?.id },
    })
  ),
  retrieve: publicProcedure
    .input(z.object({ locationId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.location.findUnique({
        where: { id: input.locationId },
      })
    ),
  create: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().nullish() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.location.create({
        data: {
          name: input.name,
          description: input.description,
          organizationId: ctx.session.user.organization?.id as string,
        },
      })
    ),
});
