import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const usersRouter = router({
  list: protectedProcedure.query(({ ctx }) => ctx.prisma.user.findMany()),
  update: protectedProcedure
    .input(
      z.object({
        organization: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          organizationId: input.organization,
        },
      })
    ),
  retrieve: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) =>
      ctx.prisma.user.findUnique({ where: { id: input } })
    ),
});
