import type { StripeSubscriptionStatus } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = router({
  getSession: publicProcedure.query(async ({ ctx }) => {
    let session = ctx.session;
    if (session?.user) {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session?.user?.id,
        },
        include: {
          organization: true,
        },
      });

      const organization = await ctx.prisma.organization.findUnique({
        where: {
          id: user?.organizationId ?? undefined,
        },
      });

      session = {
        user: {
          id: ctx.session?.user?.id as string,
          organization: {
            id: organization?.id as string,
            stripeCustomerId: organization?.stripeCustomerId as string,
            stripeSubscriptionId: organization?.stripeSubscriptionId as string,
            stripeSubscriptionStatus:
              organization?.stripeSubscriptionStatus as StripeSubscriptionStatus,
          },
        },
        expires: ctx.session?.expires as string,
      };
    }
    return session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "You are logged in and can see this secret message!";
  }),
});
