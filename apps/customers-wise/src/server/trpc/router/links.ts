import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const linksRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.link.findMany({
      where: { organizationId: ctx.session.user.organization?.id },
    })
  ),
  retrieve: publicProcedure
    .input(z.object({ linkId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.link.findUnique({
        where: { id: input.linkId },
      })
    ),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
        organizationId: z.string(),
        locationId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.link.create({
        data: {
          name: input.name,
          description: input.description,
          organizationId: input.organizationId,
          locationId: input.locationId,
        },
      })
    ),
});
