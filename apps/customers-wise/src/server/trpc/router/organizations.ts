import Stripe from "stripe";
import { z } from "zod";
import { getOrCreateStripeCustomerIdForOrganization } from "../../stripe/stripe-webhook-handler";
import { router, protectedProcedure } from "../trpc";

export const organizationsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.organization.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
    })
  ),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.create({
        data: {
          name: input.name,
          description: input.description,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "OWNER",
            },
          },
        },
      });

      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          organizationId: organization.id,
        },
      });

      await getOrCreateStripeCustomerIdForOrganization({
        organizationId: organization.id,
        prisma: ctx.prisma,
        stripe: new Stripe(process.env.STRIPE_SECRET_KEY as string, {
          apiVersion: "2022-11-15",
        }),
      });
    }),
  retrieve: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) =>
      ctx.prisma.organization.findUnique({ where: { id: input } })
    ),
});
